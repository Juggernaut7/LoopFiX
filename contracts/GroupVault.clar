;; GroupVault.clar - Collaborative savings pools for group goals
;; This contract allows multiple users to contribute to shared savings goals
;; with automatic yield distribution and group management

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant MINIMUM-CONTRIBUTION u1000000) ;; 1 STX minimum
(define-constant MAX-MEMBERS u50) ;; Maximum 50 members per group
(define-constant YIELD-RATE u500) ;; 5% annual yield

;; Error codes
(define-constant ERR-INVALID-AMOUNT (err u100))
(define-constant ERR-INVALID-DATE (err u101))
(define-constant ERR-MINIMUM-NOT-MET (err u102))
(define-constant ERR-GROUP-NOT-FOUND (err u103))
(define-constant ERR-GROUP-INACTIVE (err u104))
(define-constant ERR-NOT-AUTHORIZED (err u105))
(define-constant ERR-INSUFFICIENT-FUNDS (err u106))
(define-constant ERR-MAX-MEMBERS-REACHED (err u107))
(define-constant ERR-ALREADY-MEMBER (err u108))
(define-constant ERR-NOT-MEMBER (err u109))
(define-constant ERR-MEMBER-INACTIVE (err u110))
(define-constant ERR-GOAL-NOT-REACHED (err u111))

;; Data variables
(define-data-var total-groups uint u0)
(define-data-var total-contributions uint u0)
(define-data-var total-yield-distributed uint u0)

;; Group storage
(define-map groups uint {
  creator: principal,
  group-name: (string-ascii 50),
  target-amount: uint,
  current-amount: uint,
  created-at: uint,
  target-date: uint,
  is-active: bool,
  member-count: uint,
  yield-earned: uint
})

;; Member storage - composite key (group-id, member-address)
(define-map group-members { group-id: uint, member: principal } {
  contribution-amount: uint,
  joined-at: uint,
  is-active: bool,
  yield-share: uint
})

;; Events storage
(define-map events uint {
  event-type: (string-ascii 20),
  group-id: uint,
  member: principal,
  amount: uint,
  timestamp: uint
})

;; Helper functions
(define-private (add-event (event-type (string-ascii 20)) (group-id uint) (member principal) (amount uint))
  (let ((event-id (+ (var-get total-groups) u1)))
    (map-set events event-id {
      event-type: event-type,
      group-id: group-id,
      member: member,
      amount: amount,
      timestamp: block-height
    })
    (ok true)
  )
)

;; Public functions

;; Create a new group vault
(define-public (create-group (group-name (string-ascii 50)) (target-amount uint) (target-date uint))
  (begin
    (asserts! (>= target-amount MINIMUM-CONTRIBUTION) ERR-INVALID-AMOUNT)
    (asserts! (> target-date block-height) ERR-INVALID-DATE)
    
    (let ((group-id (+ (var-get total-groups) u1)))
      (var-set total-groups group-id)
      (map-set groups group-id {
        creator: tx-sender,
        group-name: group-name,
        target-amount: target-amount,
        current-amount: u0,
        created-at: block-height,
        target-date: target-date,
        is-active: true,
        member-count: u1,
        yield-earned: u0
      })
      ;; Add creator as first member
      (map-set group-members { group-id: group-id, member: tx-sender } {
        contribution-amount: u0,
        joined-at: block-height,
        is-active: true,
        yield-share: u0
      })
      (add-event "GROUP_CREATED" group-id tx-sender target-amount)
      (ok group-id)
    )
  )
)

;; Join an existing group
(define-public (join-group (group-id uint))
  (let ((group (map-get? groups group-id)))
    (match group
      group-data
      (begin
        (asserts! (get is-active group-data) ERR-GROUP-INACTIVE)
        (asserts! (< (get member-count group-data) MAX-MEMBERS) ERR-MAX-MEMBERS-REACHED)
        
        (let ((existing-member (map-get? group-members { group-id: group-id, member: tx-sender })))
          (asserts! (is-none existing-member) ERR-ALREADY-MEMBER)
        )
        
        (let ((new-member-count (+ (get member-count group-data) u1)))
          (map-set groups group-id (merge group-data {
            member-count: new-member-count
          }))
          (map-set group-members { group-id: group-id, member: tx-sender } {
            contribution-amount: u0,
            joined-at: block-height,
            is-active: true,
            yield-share: u0
          })
          (add-event "MEMBER_JOINED" group-id tx-sender u0)
          (ok true)
        )
      )
      ERR-GROUP-NOT-FOUND
    )
  )
)

;; Contribute to group vault
(define-public (contribute (group-id uint) (amount uint))
  (let (
    (group (map-get? groups group-id))
    (member-data (map-get? group-members { group-id: group-id, member: tx-sender }))
  )
    (match group
      group-info
      (begin
        (asserts! (>= amount MINIMUM-CONTRIBUTION) ERR-MINIMUM-NOT-MET)
        (asserts! (get is-active group-info) ERR-GROUP-INACTIVE)
        
        (match member-data
          member-info
          (begin
            (asserts! (get is-active member-info) ERR-MEMBER-INACTIVE)
            
            (let (
              (current-amount (get current-amount group-info))
              (member-contribution (get contribution-amount member-info))
              (new-amount (+ current-amount amount))
              (new-member-contribution (+ member-contribution amount))
            )
              (map-set groups group-id (merge group-info {
                current-amount: new-amount
              }))
              (map-set group-members { group-id: group-id, member: tx-sender } (merge member-info {
                contribution-amount: new-member-contribution
              }))
              (var-set total-contributions (+ (var-get total-contributions) amount))
              (add-event "CONTRIBUTION" group-id tx-sender amount)
              (ok new-amount)
            )
          )
          ERR-NOT-MEMBER
        )
      )
      ERR-GROUP-NOT-FOUND
    )
  )
)

;; Distribute yield to all members
(define-public (distribute-yield (group-id uint))
  (let ((group (map-get? groups group-id)))
    (match group
      group-data
      (begin
        (asserts! (get is-active group-data) ERR-GROUP-INACTIVE)
        
        (let (
          (current-amount (get current-amount group-data))
          (created-at (get created-at group-data))
          (time-elapsed (- block-height created-at))
          (yield-amount (/ (* current-amount YIELD-RATE time-elapsed) u525600))
        )
          (map-set groups group-id (merge group-data {
            current-amount: (+ current-amount yield-amount),
            yield-earned: (+ (get yield-earned group-data) yield-amount)
          }))
          (var-set total-yield-distributed (+ (var-get total-yield-distributed) yield-amount))
          (add-event "YIELD_DISTRIBUTED" group-id tx-sender yield-amount)
          (ok yield-amount)
        )
      )
      ERR-GROUP-NOT-FOUND
    )
  )
)

;; Withdraw member's share (only if group goal is reached)
(define-public (withdraw-share (group-id uint) (amount uint))
  (let (
    (group (map-get? groups group-id))
    (member-data (map-get? group-members { group-id: group-id, member: tx-sender }))
  )
    (match group
      group-info
      (begin
        (asserts! (>= (get current-amount group-info) (get target-amount group-info)) ERR-GOAL-NOT-REACHED)
        
        (match member-data
          member-info
          (begin
            (asserts! (get is-active member-info) ERR-MEMBER-INACTIVE)
            
            (let (
              (member-contribution (get contribution-amount member-info))
              (total-contributions (get current-amount group-info))
              (member-share (/ (* member-contribution (get current-amount group-info)) total-contributions))
            )
              (asserts! (>= member-share amount) ERR-INSUFFICIENT-FUNDS)
              
              (let ((new-amount (- (get current-amount group-info) amount)))
                (map-set groups group-id (merge group-info {
                  current-amount: new-amount
                }))
                (add-event "WITHDRAWAL" group-id tx-sender amount)
                (ok amount)
              )
            )
          )
          ERR-NOT-MEMBER
        )
      )
      ERR-GROUP-NOT-FOUND
    )
  )
)

;; Close group (only creator can close)
(define-public (close-group (group-id uint))
  (let ((group (map-get? groups group-id)))
    (match group
      group-data
      (begin
        (asserts! (is-eq tx-sender (get creator group-data)) ERR-NOT-AUTHORIZED)
        
        (map-set groups group-id (merge group-data {
          is-active: false
        }))
        (add-event "GROUP_CLOSED" group-id tx-sender (get current-amount group-data))
        (ok true)
      )
      ERR-GROUP-NOT-FOUND
    )
  )
)

;; Read-only functions

(define-read-only (get-group-info (group-id uint))
  (map-get? groups group-id)
)

(define-read-only (get-group-progress (group-id uint))
  (let ((group (map-get? groups group-id)))
    (match group
      group-data
      (ok {
        progress: (/ (* (get current-amount group-data) u100) (get target-amount group-data)),
        target-amount: (get target-amount group-data),
        current-amount: (get current-amount group-data),
        member-count: (get member-count group-data),
        yield-earned: (get yield-earned group-data),
        days-remaining: (if (> (get target-date group-data) block-height)
          (- (get target-date group-data) block-height)
          u0
        )
      })
      ERR-GROUP-NOT-FOUND
    )
  )
)

(define-read-only (get-member-info (group-id uint) (member principal))
  (map-get? group-members { group-id: group-id, member: member })
)

(define-read-only (get-total-stats)
  (ok {
    total-groups: (var-get total-groups),
    total-contributions: (var-get total-contributions),
    total-yield-distributed: (var-get total-yield-distributed)
  })
)

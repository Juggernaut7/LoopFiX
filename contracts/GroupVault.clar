;; GroupVault - Collaborative savings pools (Clarity 3 compatible)

;; Constants - numeric only, use (err CONST) in assertions
(define-constant MIN-CONTRIBUTION u1000000)
(define-constant MAX-MEMBERS u50)

;; Error codes (numeric constants)
(define-constant ERR-INVALID-AMOUNT u100)
(define-constant ERR-GROUP-NOT-FOUND u103)
(define-constant ERR-NOT-AUTHORIZED u105)
(define-constant ERR-MAX-MEMBERS u107)
(define-constant ERR-ALREADY-MEMBER u108)
(define-constant ERR-NOT-MEMBER u109)

;; Data
(define-data-var next-group-id uint u1)

;; Groups map: Clarity 3 syntax with separate key and value tuples
(define-map groups
  ((id uint))
  ((creator principal)
   (name (string-ascii 50))
   (target uint)
   (balance uint)
   (member-count uint)
   (active bool))
)

;; Members map: composite key (group id, user principal)
(define-map group-members
  ((group uint) (user principal))
  ((amount uint) (joined uint))
)

;; Create a group
(define-public (create-group (name (string-ascii 50)) (target uint))
  (let ((id (var-get next-group-id)))
    ;; Validate minimum target
    (asserts! (>= target MIN-CONTRIBUTION) (err ERR-INVALID-AMOUNT))

    ;; Insert group record with full tuple
    (map-set groups
      ((id id))
      ((creator tx-sender)
       (name name)
       (target target)
       (balance u0)
       (member-count u1)
       (active true))
    )

    ;; Add creator as first member
    (map-set group-members
      ((group id) (user tx-sender))
      ((amount u0) (joined block-height))
    )

    ;; Increment id for next group
    (var-set next-group-id (+ id u1))

    (ok id)
  )
)

;; Join an existing group
(define-public (join-group (group-id uint))
  (let ((maybe-group (map-get? groups ((id group-id)))))
    ;; Ensure group exists
    (let ((group (unwrap! maybe-group (err ERR-GROUP-NOT-FOUND))))
      ;; Check member limit
      (asserts! (< (get member-count group) MAX-MEMBERS) (err ERR-MAX-MEMBERS))

      ;; Ensure sender is not already a member
      (asserts! (is-none (map-get? group-members ((group group-id) (user tx-sender)))) (err ERR-ALREADY-MEMBER))

      ;; Add member record
      (map-set group-members
        ((group group-id) (user tx-sender))
        ((amount u0) (joined block-height))
      )

      ;; Update member count by reconstructing full tuple
      (map-set groups
        ((id group-id))
        ((creator (get creator group))
         (name (get name group))
         (target (get target group))
         (balance (get balance group))
         (member-count (+ (get member-count group) u1))
         (active (get active group)))
      )

      (ok true)
    )
  )
)

;; Contribute to group
(define-public (contribute (group-id uint) (amount uint))
  (let (
    (maybe-group (map-get? groups ((id group-id))))
    (maybe-member (map-get? group-members ((group group-id) (user tx-sender))))
  )
    (let (
      (group (unwrap! maybe-group (err ERR-GROUP-NOT-FOUND)))
      (member (unwrap! maybe-member (err ERR-NOT-MEMBER)))
    )
      ;; Validate amount
      (asserts! (>= amount MIN-CONTRIBUTION) (err ERR-INVALID-AMOUNT))

      ;; Update member contribution
      (map-set group-members
        ((group group-id) (user tx-sender))
        ((amount (+ (get amount member) amount))
         (joined (get joined member)))
      )

      ;; Update group balance
      (map-set groups
        ((id group-id))
        ((creator (get creator group))
         (name (get name group))
         (target (get target group))
         (balance (+ (get balance group) amount))
         (member-count (get member-count group))
         (active (get active group)))
      )

      (ok true)
    )
  )
)

;; Withdraw share (if goal reached)
(define-public (withdraw-share (group-id uint) (amount uint))
  (let (
    (maybe-group (map-get? groups ((id group-id))))
    (maybe-member (map-get? group-members ((group group-id) (user tx-sender))))
  )
    (let (
      (group (unwrap! maybe-group (err ERR-GROUP-NOT-FOUND)))
      (member (unwrap! maybe-member (err ERR-NOT-MEMBER)))
    )
      ;; Check if goal is reached
      (asserts! (>= (get balance group) (get target group)) (err ERR-NOT-AUTHORIZED))
      
      ;; Check member has enough contribution
      (asserts! (>= (get amount member) amount) (err ERR-INVALID-AMOUNT))

      ;; Update member
      (map-set group-members
        ((group group-id) (user tx-sender))
        ((amount (- (get amount member) amount))
         (joined (get joined member)))
      )

      ;; Update group balance
      (map-set groups
        ((id group-id))
        ((creator (get creator group))
         (name (get name group))
         (target (get target group))
         (balance (- (get balance group) amount))
         (member-count (get member-count group))
         (active (get active group)))
      )

      (ok amount)
    )
  )
)

;; Read-only: get group data
(define-read-only (get-group (id uint))
  (map-get? groups ((id id)))
)

;; Read-only: get member data
(define-read-only (get-member (group-id uint) (user principal))
  (map-get? group-members ((group group-id) (user user)))
)

;; Read-only: get next group ID
(define-read-only (get-next-id)
  (ok (var-get next-group-id))
)


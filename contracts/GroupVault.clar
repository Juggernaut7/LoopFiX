;; GroupVault - Collaborative savings pools (Clarity 3)

;; Error codes
(define-constant ERR-INVALID-AMOUNT u100)
(define-constant ERR-NOT-FOUND u103)
(define-constant ERR-NOT-MEMBER u109)
(define-constant ERR-MAX-MEMBERS u107)

;; Data
(define-data-var next-id uint u1)

;; Maps using Clarity 2/3 compatible syntax
(define-map groups { id: uint } {
  creator: principal,
  name: (string-ascii 50),
  target: uint,
  balance: uint,
  members: uint
})

(define-map members { group: uint, user: principal } {
  amount: uint,
  joined: uint
})

;; Create group
(define-public (create-group (group-name (string-ascii 50)) (target-amount uint))
  (let ((group-id (var-get next-id)))
    (asserts! (>= target-amount u1000000) (err ERR-INVALID-AMOUNT))
    
    (map-set groups { id: group-id } {
      creator: tx-sender,
      name: group-name,
      target: target-amount,
      balance: u0,
      members: u1
    })
    
    (map-set members { group: group-id, user: tx-sender } {
      amount: u0,
      joined: block-height
    })
    
    (var-set next-id (+ group-id u1))
    (ok group-id)
  )
)

;; Join group
(define-public (join-group (group-id uint))
  (match (map-get? groups { id: group-id })
    group-data
    (begin
      (asserts! (< (get members group-data) u50) (err ERR-MAX-MEMBERS))
      (asserts! (is-none (map-get? members { group: group-id, user: tx-sender })) (err u108))
      
      (map-set members { group: group-id, user: tx-sender } {
        amount: u0,
        joined: block-height
      })
      
      (map-set groups { id: group-id } (merge group-data {
        members: (+ (get members group-data) u1)
      }))
      
      (ok true)
    )
    (err ERR-NOT-FOUND)
  )
)

;; Contribute
(define-public (contribute (group-id uint) (amount uint))
  (match (map-get? groups { id: group-id })
    group-data
    (match (map-get? members { group: group-id, user: tx-sender })
      member-data
      (begin
        (asserts! (>= amount u1000000) (err ERR-INVALID-AMOUNT))
        
        (map-set members { group: group-id, user: tx-sender } (merge member-data {
          amount: (+ (get amount member-data) amount)
        }))
        
        (map-set groups { id: group-id } (merge group-data {
          balance: (+ (get balance group-data) amount)
        }))
        
        (ok true)
      )
      (err ERR-NOT-MEMBER)
    )
    (err ERR-NOT-FOUND)
  )
)

;; Read-only
(define-read-only (get-group (id uint))
  (map-get? groups { id: id })
)

(define-read-only (get-member (group-id uint) (user principal))
  (map-get? members { group: group-id, user: user })
)

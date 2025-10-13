;; SavingsVault - Individual savings goals (Clarity 3)

;; Error codes
(define-constant ERR-INVALID-AMOUNT u100)
(define-constant ERR-NOT-FOUND u103)
(define-constant ERR-NOT-AUTHORIZED u105)
(define-constant ERR-INSUFFICIENT-FUNDS u106)

;; Data
(define-data-var next-id uint u1)

;; Maps using Clarity 2/3 compatible syntax (like hello-world)
(define-map vaults { id: uint } {
  owner: principal,
  target: uint,
  balance: uint,
  created: uint
})

;; Create vault
(define-public (create-vault (target-amount uint))
  (let ((vault-id (var-get next-id)))
    (asserts! (>= target-amount u1000000) (err ERR-INVALID-AMOUNT))
    
    (map-set vaults { id: vault-id } {
      owner: tx-sender,
      target: target-amount,
      balance: u0,
      created: u1
    })
    
    (var-set next-id (+ vault-id u1))
    (ok vault-id)
  )
)

;; Deposit
(define-public (deposit (vault-id uint) (amount uint))
  (match (map-get? vaults { id: vault-id })
    vault-data
    (begin
      (asserts! (is-eq tx-sender (get owner vault-data)) (err ERR-NOT-AUTHORIZED))
      (asserts! (>= amount u1000000) (err ERR-INVALID-AMOUNT))
      
      (map-set vaults { id: vault-id } (merge vault-data {
        balance: (+ (get balance vault-data) amount)
      }))
      
      (ok true)
    )
    (err ERR-NOT-FOUND)
  )
)

;; Withdraw
(define-public (withdraw (vault-id uint) (amount uint))
  (match (map-get? vaults { id: vault-id })
    vault-data
    (begin
      (asserts! (is-eq tx-sender (get owner vault-data)) (err ERR-NOT-AUTHORIZED))
      (asserts! (>= (get balance vault-data) amount) (err ERR-INSUFFICIENT-FUNDS))
      
      (map-set vaults { id: vault-id } (merge vault-data {
        balance: (- (get balance vault-data) amount)
      }))
      
      (ok true)
    )
    (err ERR-NOT-FOUND)
  )
)

;; Read-only
(define-read-only (get-vault (id uint))
  (map-get? vaults { id: id })
)

(define-read-only (get-progress (id uint))
  (match (map-get? vaults { id: id })
    vault-data
    (ok {
      progress: (/ (* (get balance vault-data) u100) (get target vault-data)),
      target: (get target vault-data),
      balance: (get balance vault-data)
    })
    (err ERR-NOT-FOUND)
  )
)

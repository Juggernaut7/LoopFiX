;; SavingsVault - Individual savings goals (Clarity 3 compatible)

;; Constants
(define-constant MIN-DEPOSIT u1000000)

;; Error codes (numeric constants)
(define-constant ERR-INVALID-AMOUNT u100)
(define-constant ERR-VAULT-NOT-FOUND u103)
(define-constant ERR-NOT-AUTHORIZED u105)
(define-constant ERR-INSUFFICIENT-FUNDS u106)

;; Data
(define-data-var next-vault-id uint u1)

;; Vaults map: Clarity 3 syntax
(define-map vaults
  ((id uint))
  ((owner principal)
   (target uint)
   (balance uint)
   (created uint)
   (active bool))
)

;; Create vault
(define-public (create-vault (target uint))
  (let ((id (var-get next-vault-id)))
    (asserts! (>= target MIN-DEPOSIT) (err ERR-INVALID-AMOUNT))
    
    (map-set vaults
      ((id id))
      ((owner tx-sender)
       (target target)
       (balance u0)
       (created block-height)
       (active true))
    )
    
    (var-set next-vault-id (+ id u1))
    (ok id)
  )
)

;; Deposit to vault
(define-public (deposit (vault-id uint) (amount uint))
  (let ((maybe-vault (map-get? vaults ((id vault-id)))))
    (let ((vault (unwrap! maybe-vault (err ERR-VAULT-NOT-FOUND))))
      (asserts! (is-eq tx-sender (get owner vault)) (err ERR-NOT-AUTHORIZED))
      (asserts! (>= amount MIN-DEPOSIT) (err ERR-INVALID-AMOUNT))
      
      ;; Update vault with full tuple
      (map-set vaults
        ((id vault-id))
        ((owner (get owner vault))
         (target (get target vault))
         (balance (+ (get balance vault) amount))
         (created (get created vault))
         (active (get active vault)))
      )
      
      (ok true)
    )
  )
)

;; Withdraw from vault
(define-public (withdraw (vault-id uint) (amount uint))
  (let ((maybe-vault (map-get? vaults ((id vault-id)))))
    (let ((vault (unwrap! maybe-vault (err ERR-VAULT-NOT-FOUND))))
      (asserts! (is-eq tx-sender (get owner vault)) (err ERR-NOT-AUTHORIZED))
      (asserts! (>= (get balance vault) amount) (err ERR-INSUFFICIENT-FUNDS))
      
      ;; Update vault with full tuple
      (map-set vaults
        ((id vault-id))
        ((owner (get owner vault))
         (target (get target vault))
         (balance (- (get balance vault) amount))
         (created (get created vault))
         (active (get active vault)))
      )
      
      (ok true)
    )
  )
)

;; Read-only: get vault
(define-read-only (get-vault (id uint))
  (map-get? vaults ((id id)))
)

;; Read-only: get vault progress
(define-read-only (get-vault-progress (id uint))
  (let ((maybe-vault (map-get? vaults ((id id)))))
    (let ((vault (unwrap! maybe-vault (err ERR-VAULT-NOT-FOUND))))
      (ok {
        progress: (/ (* (get balance vault) u100) (get target vault)),
        target: (get target vault),
        balance: (get balance vault)
      })
    )
  )
)

;; Read-only: get next vault ID
(define-read-only (get-next-id)
  (ok (var-get next-vault-id))
)


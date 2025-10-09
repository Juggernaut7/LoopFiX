;; SavingsVault.clar - Individual savings goals as smart contracts
;; This contract allows users to create savings goals and deposit funds
;; with automatic yield generation through DeFi protocols

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant MINIMUM-DEPOSIT u1000000) ;; 1 STX minimum
(define-constant YIELD-RATE u500) ;; 5% annual yield (500 basis points)
(define-constant STAKING-APY u850) ;; 8.5% APY for STX staking
(define-constant DEFI-APY u1570) ;; 15.7% APY for DeFi pools
(define-constant BTC-YIELD-APY u1230) ;; 12.3% APY for Bitcoin yield

;; Error codes
(define-constant ERR-INVALID-AMOUNT (err u100))
(define-constant ERR-INVALID-DATE (err u101))
(define-constant ERR-MINIMUM-NOT-MET (err u102))
(define-constant ERR-VAULT-NOT-FOUND (err u103))
(define-constant ERR-VAULT-INACTIVE (err u104))
(define-constant ERR-NOT-AUTHORIZED (err u105))
(define-constant ERR-INSUFFICIENT-FUNDS (err u106))
(define-constant ERR-NO-STAKED-FUNDS (err u107))

;; Data variables
(define-data-var total-vaults uint u0)
(define-data-var total-deposits uint u0)
(define-data-var total-yield-distributed uint u0)

;; Vault storage - map of vault-id to vault data
(define-map vaults uint {
  owner: principal,
  target-amount: uint,
  current-amount: uint,
  created-at: uint,
  target-date: uint,
  is-active: bool,
  yield-earned: uint,
  yield-strategy: (string-ascii 20),
  staked-amount: uint,
  defi-pool-id: uint
})

;; Events storage
(define-map events uint {
  event-type: (string-ascii 20),
  vault-id: uint,
  amount: uint,
  timestamp: uint
})

;; Helper functions
(define-private (add-event (event-type (string-ascii 20)) (vault-id uint) (amount uint))
  (let ((event-id (+ (var-get total-vaults) u1)))
    (map-set events event-id {
      event-type: event-type,
      vault-id: vault-id,
      amount: amount,
      timestamp: block-height
    })
    (ok true)
  )
)

;; Public functions

;; Create a new savings vault
(define-public (create-vault (target-amount uint) (target-date uint))
  (begin
    (asserts! (>= target-amount MINIMUM-DEPOSIT) ERR-INVALID-AMOUNT)
    (asserts! (> target-date block-height) ERR-INVALID-DATE)
    
    (let ((vault-id (+ (var-get total-vaults) u1)))
      (var-set total-vaults vault-id)
      (map-set vaults vault-id {
        owner: tx-sender,
        target-amount: target-amount,
        current-amount: u0,
        created-at: block-height,
        target-date: target-date,
        is-active: true,
        yield-earned: u0,
        yield-strategy: "none",
        staked-amount: u0,
        defi-pool-id: u0
      })
      (add-event "VAULT_CREATED" vault-id target-amount)
      (ok vault-id)
    )
  )
)

;; Deposit funds into vault
(define-public (deposit (vault-id uint) (amount uint))
  (let ((vault (map-get? vaults vault-id)))
    (match vault
      vault-data
      (begin
        (asserts! (>= amount MINIMUM-DEPOSIT) ERR-MINIMUM-NOT-MET)
        (asserts! (get is-active vault-data) ERR-VAULT-INACTIVE)
        (asserts! (is-eq tx-sender (get owner vault-data)) ERR-NOT-AUTHORIZED)
        
        (let ((new-amount (+ (get current-amount vault-data) amount)))
          (map-set vaults vault-id (merge vault-data {
            current-amount: new-amount
          }))
          (var-set total-deposits (+ (var-get total-deposits) amount))
          (add-event "DEPOSIT" vault-id amount)
          (ok new-amount)
        )
      )
      ERR-VAULT-NOT-FOUND
    )
  )
)

;; Withdraw funds from vault
(define-public (withdraw (vault-id uint) (amount uint))
  (let ((vault (map-get? vaults vault-id)))
    (match vault
      vault-data
      (begin
        (asserts! (is-eq tx-sender (get owner vault-data)) ERR-NOT-AUTHORIZED)
        (asserts! (>= (get current-amount vault-data) amount) ERR-INSUFFICIENT-FUNDS)
        
        (let ((new-amount (- (get current-amount vault-data) amount)))
          (map-set vaults vault-id (merge vault-data {
            current-amount: new-amount
          }))
          (add-event "WITHDRAWAL" vault-id amount)
          (ok new-amount)
        )
      )
      ERR-VAULT-NOT-FOUND
    )
  )
)

;; Calculate and distribute yield
(define-public (distribute-yield (vault-id uint))
  (let ((vault (map-get? vaults vault-id)))
    (match vault
      vault-data
      (begin
        (asserts! (get is-active vault-data) ERR-VAULT-INACTIVE)
        
        (let (
          (current-amount (get current-amount vault-data))
          (created-at (get created-at vault-data))
          (time-elapsed (- block-height created-at))
          (yield-amount (/ (* current-amount YIELD-RATE time-elapsed) u525600))
        )
          (map-set vaults vault-id (merge vault-data {
            current-amount: (+ current-amount yield-amount),
            yield-earned: (+ (get yield-earned vault-data) yield-amount)
          }))
          (var-set total-yield-distributed (+ (var-get total-yield-distributed) yield-amount))
          (add-event "YIELD_DISTRIBUTED" vault-id yield-amount)
          (ok yield-amount)
        )
      )
      ERR-VAULT-NOT-FOUND
    )
  )
)

;; Close vault
(define-public (close-vault (vault-id uint))
  (let ((vault (map-get? vaults vault-id)))
    (match vault
      vault-data
      (begin
        (asserts! (is-eq tx-sender (get owner vault-data)) ERR-NOT-AUTHORIZED)
        
        (map-set vaults vault-id (merge vault-data {
          is-active: false
        }))
        (add-event "VAULT_CLOSED" vault-id (get current-amount vault-data))
        (ok true)
      )
      ERR-VAULT-NOT-FOUND
    )
  )
)

;; Stake STX for yield generation
(define-public (stake-for-yield (vault-id uint) (amount uint) (strategy (string-ascii 20)))
  (let ((vault (map-get? vaults vault-id)))
    (match vault
      vault-data
      (begin
        (asserts! (is-eq tx-sender (get owner vault-data)) ERR-NOT-AUTHORIZED)
        (asserts! (get is-active vault-data) ERR-VAULT-INACTIVE)
        (asserts! (>= amount MINIMUM-DEPOSIT) ERR-INVALID-AMOUNT)
        (asserts! (>= (get current-amount vault-data) amount) ERR-INSUFFICIENT-FUNDS)
        
        (let ((yield-amount (calculate-yield amount strategy)))
          (map-set vaults vault-id (merge vault-data {
            yield-strategy: strategy,
            staked-amount: amount,
            defi-pool-id: u1,
            yield-earned: (+ (get yield-earned vault-data) yield-amount)
          }))
          (var-set total-yield-distributed (+ (var-get total-yield-distributed) yield-amount))
          (ok true)
        )
      )
      ERR-VAULT-NOT-FOUND
    )
  )
)

;; Calculate yield based on strategy
(define-private (calculate-yield (amount uint) (strategy (string-ascii 20)))
  (if (is-eq strategy "staking")
    (/ (* amount STAKING-APY) u10000)
    (if (is-eq strategy "defi")
      (/ (* amount DEFI-APY) u10000)
      (if (is-eq strategy "btc-yield")
        (/ (* amount BTC-YIELD-APY) u10000)
        (/ (* amount YIELD-RATE) u10000)
      )
    )
  )
)

;; Unstake from yield farming
(define-public (unstake-from-yield (vault-id uint))
  (let ((vault (map-get? vaults vault-id)))
    (match vault
      vault-data
      (begin
        (asserts! (is-eq tx-sender (get owner vault-data)) ERR-NOT-AUTHORIZED)
        (asserts! (> (get staked-amount vault-data) u0) ERR-NO-STAKED-FUNDS)
        
        (map-set vaults vault-id (merge vault-data {
          yield-strategy: "none",
          staked-amount: u0,
          defi-pool-id: u0
        }))
        (ok true)
      )
      ERR-VAULT-NOT-FOUND
    )
  )
)

;; Read-only functions

(define-read-only (get-vault-info (vault-id uint))
  (map-get? vaults vault-id)
)

(define-read-only (get-vault-progress (vault-id uint))
  (let ((vault (map-get? vaults vault-id)))
    (match vault
      vault-data
      (ok {
        progress: (/ (* (get current-amount vault-data) u100) (get target-amount vault-data)),
        target-amount: (get target-amount vault-data),
        current-amount: (get current-amount vault-data),
        yield-earned: (get yield-earned vault-data),
        days-remaining: (if (> (get target-date vault-data) block-height)
          (- (get target-date vault-data) block-height)
          u0
        )
      })
      ERR-VAULT-NOT-FOUND
    )
  )
)

(define-read-only (get-total-stats)
  (ok {
    total-vaults: (var-get total-vaults),
    total-deposits: (var-get total-deposits),
    total-yield-distributed: (var-get total-yield-distributed)
  })
)

(define-read-only (get-yield-rates)
  (ok {
    staking-apy: STAKING-APY,
    defi-apy: DEFI-APY,
    btc-yield-apy: BTC-YIELD-APY,
    base-yield-rate: YIELD-RATE
  })
)

(define-read-only (get-vault-yield-info (vault-id uint))
  (let ((vault (map-get? vaults vault-id)))
    (match vault
      vault-data
      (ok {
        yield-strategy: (get yield-strategy vault-data),
        staked-amount: (get staked-amount vault-data),
        defi-pool-id: (get defi-pool-id vault-data),
        yield-earned: (get yield-earned vault-data)
      })
      ERR-VAULT-NOT-FOUND
    )
  )
)

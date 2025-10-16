;; StakingVault - Simplified Pattern (Following SavingsVault/GroupVault)

;; Error codes
(define-constant ERR-INVALID-AMOUNT u100)
(define-constant ERR-NOT-FOUND u103)
(define-constant ERR-NOT-AUTHORIZED u105)
(define-constant ERR-POOL-LOCKED u107)

;; Data
(define-data-var next-pool-id uint u1)
(define-data-var next-stake-id uint u1)

;; Maps - Simple structure like working contracts
(define-map pools { id: uint } {
  creator: principal,
  name: (string-ascii 50),
  apy: uint,
  min-stake: uint,
  max-stake: uint,
  total-staked: uint,
  participants: uint,
  is-active: bool
})

(define-map stakes { id: uint } {
  pool-id: uint,
  staker: principal,
  amount: uint,
  claimed-rewards: uint,
  is-active: bool,
  created: uint
})

;; Create pool - Simple like create-vault
(define-public (create-pool (pool-name (string-ascii 50)) (apy uint) (min-stake uint) (max-stake uint))
  (let ((pool-id (var-get next-pool-id)))
    (asserts! (>= apy u100) (err ERR-INVALID-AMOUNT))
    (asserts! (>= min-stake u100000) (err ERR-INVALID-AMOUNT))
    (asserts! (>= max-stake min-stake) (err ERR-INVALID-AMOUNT))

    (map-set pools { id: pool-id } {
      creator: tx-sender,
      name: pool-name,
      apy: apy,
      min-stake: min-stake,
      max-stake: max-stake,
      total-staked: u0,
      participants: u0,
      is-active: true
    })

    (var-set next-pool-id (+ pool-id u1))
    (ok pool-id)
  )
)

;; Stake STX - Simple like deposit
(define-public (stake-stx (pool-id uint) (amount uint))
  (match (map-get? pools { id: pool-id })
    pool-data
    (begin
      (asserts! (get is-active pool-data) (err ERR-POOL-LOCKED))
      (asserts! (>= amount (get min-stake pool-data)) (err ERR-INVALID-AMOUNT))
      (asserts! (<= amount (get max-stake pool-data)) (err ERR-INVALID-AMOUNT))

      (let ((stake-id (var-get next-stake-id)))
        (map-set stakes { id: stake-id } {
          pool-id: pool-id,
          staker: tx-sender,
          amount: amount,
          claimed-rewards: u0,
          is-active: true,
          created: u1
        })

        (map-set pools { id: pool-id } (merge pool-data {
          total-staked: (+ (get total-staked pool-data) amount),
          participants: (+ (get participants pool-data) u1)
        }))

        (var-set next-stake-id (+ stake-id u1))
        (ok stake-id)
      )
    )
    (err ERR-NOT-FOUND)
  )
)

;; Unstake STX - Simple like withdraw
(define-public (unstake-stx (stake-id uint))
  (match (map-get? stakes { id: stake-id })
    stake-data
    (begin
      (asserts! (is-eq tx-sender (get staker stake-data)) (err ERR-NOT-AUTHORIZED))
      (asserts! (get is-active stake-data) (err ERR-POOL-LOCKED))

      (match (map-get? pools { id: (get pool-id stake-data) })
        pool-data
        (begin
          (map-set stakes { id: stake-id } (merge stake-data {
            is-active: false
          }))

          (map-set pools { id: (get pool-id stake-data) } (merge pool-data {
            total-staked: (- (get total-staked pool-data) (get amount stake-data)),
            participants: (- (get participants pool-data) u1)
          }))

          (ok stake-id)
        )
        (err ERR-NOT-FOUND)
      )
    )
    (err ERR-NOT-FOUND)
  )
)

;; Claim rewards - Simple calculation
(define-public (claim-rewards (stake-id uint))
  (match (map-get? stakes { id: stake-id })
    stake-data
    (begin
      (asserts! (is-eq tx-sender (get staker stake-data)) (err ERR-NOT-AUTHORIZED))
      (asserts! (get is-active stake-data) (err ERR-POOL-LOCKED))

      (let ((claimable-rewards (/ (get amount stake-data) u100)))
        (map-set stakes { id: stake-id } (merge stake-data {
          claimed-rewards: (+ (get claimed-rewards stake-data) claimable-rewards)
        }))
        (ok claimable-rewards)
      )
    )
    (err ERR-NOT-FOUND)
  )
)

;; Deactivate pool - Simple admin function
(define-public (deactivate-pool (pool-id uint))
  (match (map-get? pools { id: pool-id })
    pool-data
    (begin
      (asserts! (is-eq tx-sender (get creator pool-data)) (err ERR-NOT-AUTHORIZED))
      (map-set pools { id: pool-id } (merge pool-data { is-active: false }))
      (ok pool-id)
    )
    (err ERR-NOT-FOUND)
  )
)

;; Read-only functions
(define-read-only (get-pool (id uint)) 
  (map-get? pools { id: id })
)

(define-read-only (get-stake (id uint)) 
  (map-get? stakes { id: id })
)
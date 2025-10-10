;; AdvisorNFT - Milestone achievement badges (Clarity 3 compatible)

;; Constants
(define-constant ERR-NOT-AUTHORIZED u401)
(define-constant ERR-NOT-FOUND u404)
(define-constant ERR-ALREADY-MINTED u409)

;; Milestone thresholds
(define-constant MILESTONE-BEGINNER u1000000)
(define-constant MILESTONE-INTERMEDIATE u10000000)
(define-constant MILESTONE-ADVANCED u50000000)
(define-constant MILESTONE-EXPERT u100000000)
(define-constant MILESTONE-LEGEND u500000000)

;; NFT definition
(define-non-fungible-token advisor-badge uint)

;; Data
(define-data-var last-token-id uint u0)

;; Badge metadata map
(define-map badge-metadata
  ((token-id uint))
  ((owner principal)
   (milestone (string-ascii 20))
   (amount uint)
   (earned uint))
)

;; User milestones map (prevent duplicates)
(define-map user-milestones
  ((user principal) (milestone (string-ascii 20)))
  ((claimed bool))
)

;; Mint milestone badge
(define-public (mint-badge (milestone (string-ascii 20)) (amount uint))
  (let ((token-id (+ (var-get last-token-id) u1)))
    ;; Check not already claimed
    (asserts! (is-none (map-get? user-milestones ((user tx-sender) (milestone milestone)))) (err ERR-ALREADY-MINTED))
    
    ;; Mint NFT
    (try! (nft-mint? advisor-badge token-id tx-sender))
    
    ;; Store metadata
    (map-set badge-metadata
      ((token-id token-id))
      ((owner tx-sender)
       (milestone milestone)
       (amount amount)
       (earned block-height))
    )
    
    ;; Mark as claimed
    (map-set user-milestones
      ((user tx-sender) (milestone milestone))
      ((claimed true))
    )
    
    ;; Update counter
    (var-set last-token-id token-id)
    
    (ok token-id)
  )
)

;; Transfer badge
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err ERR-NOT-AUTHORIZED))
    (nft-transfer? advisor-badge token-id sender recipient)
  )
)

;; Read-only: get owner
(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? advisor-badge token-id))
)

;; Read-only: get badge metadata
(define-read-only (get-badge-metadata (token-id uint))
  (map-get? badge-metadata ((token-id token-id)))
)

;; Read-only: check if milestone claimed
(define-read-only (has-milestone (user principal) (milestone (string-ascii 20)))
  (is-some (map-get? user-milestones ((user user) (milestone milestone))))
)

;; Read-only: get last token ID
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

;; Read-only: get milestone thresholds
(define-read-only (get-thresholds)
  (ok {
    beginner: MILESTONE-BEGINNER,
    intermediate: MILESTONE-INTERMEDIATE,
    advanced: MILESTONE-ADVANCED,
    expert: MILESTONE-EXPERT,
    legend: MILESTONE-LEGEND
  })
)


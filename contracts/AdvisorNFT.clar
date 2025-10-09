;; AdvisorNFT.clar - Milestone achievement NFT badges
;; Users earn NFT badges for reaching savings milestones
;; These NFTs can be displayed as achievements and provide special benefits

;; Constants
(define-constant CONTRACT-OWNER tx-sender)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-ALREADY-MINTED (err u409))
(define-constant ERR-INVALID-MILESTONE (err u400))

;; NFT definition
(define-non-fungible-token advisor-badge uint)

;; Data variables
(define-data-var last-token-id uint u0)
(define-data-var total-minted uint u0)

;; Milestone tiers
(define-constant MILESTONE-BEGINNER u1000000) ;; 1 STX
(define-constant MILESTONE-INTERMEDIATE u10000000) ;; 10 STX
(define-constant MILESTONE-ADVANCED u50000000) ;; 50 STX
(define-constant MILESTONE-EXPERT u100000000) ;; 100 STX
(define-constant MILESTONE-LEGEND u500000000) ;; 500 STX

;; Badge metadata
(define-map badge-metadata uint {
  milestone-type: (string-ascii 20),
  earned-at: uint,
  vault-id: uint,
  amount-saved: uint,
  badge-name: (string-ascii 50),
  badge-description: (string-ascii 200)
})

;; User badge tracking
(define-map user-badges principal (list 20 uint))

;; Milestone tracking - prevent duplicate minting
(define-map milestone-claimed { user: principal, milestone: (string-ascii 20) } bool)

;; Helper functions

(define-private (get-milestone-name (amount uint))
  (if (>= amount MILESTONE-LEGEND)
    "Legend"
    (if (>= amount MILESTONE-EXPERT)
      "Expert"
      (if (>= amount MILESTONE-ADVANCED)
        "Advanced"
        (if (>= amount MILESTONE-INTERMEDIATE)
          "Intermediate"
          "Beginner"
        )
      )
    )
  )
)

(define-private (get-milestone-description (milestone-name (string-ascii 20)))
  (if (is-eq milestone-name "Legend")
    "Saved over 500 STX! You're a savings legend!"
    (if (is-eq milestone-name "Expert")
      "Saved over 100 STX! Expert saver status achieved!"
      (if (is-eq milestone-name "Advanced")
        "Saved over 50 STX! Advanced saver unlocked!"
        (if (is-eq milestone-name "Intermediate")
          "Saved over 10 STX! Intermediate saver!"
          "Saved your first 1 STX! Beginner saver!"
        )
      )
    )
  )
)

;; Public functions

;; Mint a new milestone badge
(define-public (mint-milestone-badge (vault-id uint) (amount-saved uint))
  (let (
    (token-id (+ (var-get last-token-id) u1))
    (milestone-name (get-milestone-name amount-saved))
    (milestone-desc (get-milestone-description milestone-name))
    (claim-key { user: tx-sender, milestone: milestone-name })
  )
    ;; Check if milestone already claimed
    (asserts! (is-none (map-get? milestone-claimed claim-key)) ERR-ALREADY-MINTED)
    
    ;; Validate milestone amount
    (asserts! (>= amount-saved MILESTONE-BEGINNER) ERR-INVALID-MILESTONE)
    
    ;; Mint the NFT
    (try! (nft-mint? advisor-badge token-id tx-sender))
    
    ;; Store metadata
    (map-set badge-metadata token-id {
      milestone-type: milestone-name,
      earned-at: block-height,
      vault-id: vault-id,
      amount-saved: amount-saved,
      badge-name: milestone-name,
      badge-description: milestone-desc
    })
    
    ;; Mark milestone as claimed
    (map-set milestone-claimed claim-key true)
    
    ;; Update user's badge list
    (let ((user-badge-list (default-to (list) (map-get? user-badges tx-sender))))
      (map-set user-badges tx-sender (unwrap-panic (as-max-len? (append user-badge-list token-id) u20)))
    )
    
    ;; Update counters
    (var-set last-token-id token-id)
    (var-set total-minted (+ (var-get total-minted) u1))
    
    (ok token-id)
  )
)

;; Transfer badge (NFTs are transferable)
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-AUTHORIZED)
    (try! (nft-transfer? advisor-badge token-id sender recipient))
    
    ;; Update recipient's badge list
    (let ((recipient-badges (default-to (list) (map-get? user-badges recipient))))
      (map-set user-badges recipient (unwrap-panic (as-max-len? (append recipient-badges token-id) u20)))
    )
    
    (ok true)
  )
)

;; Burn badge (optional - user can burn their own badges)
(define-public (burn (token-id uint))
  (let ((owner (unwrap! (nft-get-owner? advisor-badge token-id) ERR-NOT-FOUND)))
    (asserts! (is-eq tx-sender owner) ERR-NOT-AUTHORIZED)
    (try! (nft-burn? advisor-badge token-id owner))
    (ok true)
  )
)

;; Read-only functions

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

(define-read-only (get-total-minted)
  (ok (var-get total-minted))
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? advisor-badge token-id))
)

(define-read-only (get-badge-metadata (token-id uint))
  (map-get? badge-metadata token-id)
)

(define-read-only (get-user-badges (user principal))
  (map-get? user-badges user)
)

(define-read-only (has-milestone (user principal) (milestone (string-ascii 20)))
  (default-to false (map-get? milestone-claimed { user: user, milestone: milestone }))
)

(define-read-only (get-badge-uri (token-id uint))
  (ok (some "ipfs://QmLoopFiXBadgeMetadata/{id}"))
)

(define-read-only (get-milestone-thresholds)
  (ok {
    beginner: MILESTONE-BEGINNER,
    intermediate: MILESTONE-INTERMEDIATE,
    advanced: MILESTONE-ADVANCED,
    expert: MILESTONE-EXPERT,
    legend: MILESTONE-LEGEND
  })
)


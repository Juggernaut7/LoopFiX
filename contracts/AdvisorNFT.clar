;; AdvisorNFT - Milestone achievement badges (Clarity 3)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED u401)
(define-constant ERR-ALREADY-MINTED u409)

;; NFT definition
(define-non-fungible-token advisor-badge uint)

;; Data
(define-data-var last-id uint u0)

;; Maps
(define-map badges { id: uint } {
  owner: principal,
  milestone: (string-ascii 20),
  amount: uint,
  earned: uint
})

(define-map claimed { user: principal, milestone: (string-ascii 20) } {
  minted: bool
})

;; Mint badge
(define-public (mint-badge (milestone (string-ascii 20)) (amount uint))
  (let ((token-id (+ (var-get last-id) u1)))
    ;; Check not already claimed
    (asserts! (is-none (map-get? claimed { user: tx-sender, milestone: milestone })) (err ERR-ALREADY-MINTED))
    
    ;; Mint NFT
    (try! (nft-mint? advisor-badge token-id tx-sender))
    
    ;; Store metadata
    (map-set badges { id: token-id } {
      owner: tx-sender,
      milestone: milestone,
      amount: amount,
      earned: u1
    })
    
    ;; Mark as claimed
    (map-set claimed { user: tx-sender, milestone: milestone } {
      minted: true
    })
    
    (var-set last-id token-id)
    (ok token-id)
  )
)

;; Transfer
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err ERR-NOT-AUTHORIZED))
    (nft-transfer? advisor-badge token-id sender recipient)
  )
)

;; Read-only
(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? advisor-badge token-id))
)

(define-read-only (get-badge (id uint))
  (map-get? badges { id: id })
)

(define-read-only (has-milestone (user principal) (milestone (string-ascii 20)))
  (is-some (map-get? claimed { user: user, milestone: milestone }))
)

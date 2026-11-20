export type TopCoin = { id: string; symbol: string; name: string }

type Props = {
  coinIds: string[]
  topCoins: TopCoin[]
  selected: string | null
  onSelect: (id: string) => void
  newCoin: string
  onNewCoinChange: (id: string) => void
  onAdd: () => void
  onRemove?: (id: string) => void
  statusMsg?: string | null
}

export default function CoinSidebar({
                                      coinIds,
                                      topCoins,
                                      selected,
                                      onSelect,
                                      newCoin,
                                      onNewCoinChange,
                                      onAdd,
                                      onRemove,
                                      statusMsg,
                                    }: Props) {
  return (
    <section className="demo-watchlist">
      <div className="demo-coin-list">
        {coinIds.map((id) => {
          const coin = topCoins.find((c) => c.id === id)
          const label = coin ? `${coin.name} (${coin.symbol.toUpperCase()})` : id.toUpperCase()
          return (
            <div className="demo-coin-row" key={id}>
              <button
                type="button"
                className={selected === id ? 'demo-coin selected' : 'demo-coin'}
                aria-pressed={selected === id}
                onClick={() => onSelect(id)}
              >
                <strong>{label}</strong>
              </button>
              {onRemove && (
                <button
                  type="button"
                  className="coin-remove"
                  aria-label={`Remove ${label}`}
                  onClick={() => onRemove(id)}
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="demo-controls">
        <select value={newCoin} onChange={(e) => onNewCoinChange(e.target.value)}>
          <option value="">Add coin...</option>
          {topCoins.map((coin) => (
            <option key={coin.id} value={coin.id}>
              {coin.symbol.toUpperCase()} - {coin.name}
            </option>
          ))}
        </select>
        {newCoin && <button onClick={onAdd}>Add Coin</button>}
      </div>

      {statusMsg && <p className="sidebar-status" role="status">{statusMsg}</p>}
    </section>
  )
}
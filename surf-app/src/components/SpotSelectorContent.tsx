interface SpotSelectorContentProps {
  spotId: string
  onSpotIdChange: (value: string) => void
  onConfirm: () => void
}

export const SpotSelectorContent = ({
  spotId,
  onSpotIdChange,
  onConfirm,
}: SpotSelectorContentProps) => (
  <div className='p-4'>
    <label className='text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400'>
      ID del spot
      <input
        type='text'
        value={spotId}
        onChange={(e) => onSpotIdChange(e.target.value)}
        className='mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
        placeholder='sopelana'
      />
    </label>
    <button
      onClick={onConfirm}
      className='mt-4 w-full rounded-2xl bg-sky-600 py-2 text-sm font-semibold text-white'
    >
      Confirmar
    </button>
  </div>
)

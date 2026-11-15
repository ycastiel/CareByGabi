/** Paisagem geométrica original feita com CSS, sem imagens remotas ou scripts. */
export function AeroAtmosfera({ variante }: { variante: 'inicio' | 'entrada' }) {
  return <div className={`aero-atmosfera aero-atmosfera--${variante}`} aria-hidden="true">
    <span className="aero-atmosfera__luz" />
    <span className="aero-atmosfera__orbe aero-atmosfera__orbe--maior" />
    <span className="aero-atmosfera__orbe aero-atmosfera__orbe--menor" />
    <span className="aero-atmosfera__orbe aero-atmosfera__orbe--pequeno" />
    <span className="aero-atmosfera__agua" />
    <span className="aero-atmosfera__brilho" />
  </div>
}

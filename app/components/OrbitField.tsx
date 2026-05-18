"use client";

export function OrbitField() {
  return (
    <div className="orbitField" aria-hidden="true">
      <div className="earthDisc" />
      <div className="orbit orbitOne" />
      <div className="orbit orbitTwo" />
      <div className="scanLine" />
      <div className="coordinate coordinateOne">37.7749 N / 122.4194 W</div>
      <div className="coordinate coordinateTwo">tasking window 04:30 UTC</div>
    </div>
  );
}

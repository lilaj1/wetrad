import { createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";

export default function TradeChart({ priceData = [], markers = [] }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const chart = createChart(ref.current, {
      width: ref.current.clientWidth || 800,
      height: 400
    });

    const series = chart.addCandlestickSeries();

    if (priceData.length) series.setData(priceData);
    if (markers.length) series.setMarkers(markers);

    return () => chart.remove();
  }, [priceData, markers]);

  return <div className="chart" ref={ref} />;
}

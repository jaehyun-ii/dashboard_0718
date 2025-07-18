"use client";

export default function ModeChart() {
  const modes = [
    "MODE 3",
    "MODE 2",
    "MODE 1",
    "MODE 3",
    "MODE 4",
    "MODE 6",
    "MODE 6Q",
    "MODE 4",
    "MODE 3",
    "MODE 1",
  ];

  const durations = [
    "26초",
    "7분 15초",
    "20분 21초",
    "1시간 10분 39초",
    "7분 34초",
    "16초",
    "11시간 25분 59초",
    "2분 38초",
    "10분 16초",
    "6분 1초",
  ];

  return (
    <div className="w-full flex justify-center overflow-x-auto">
      <table className="min-w-[300px] border border-slate-300 text-xs text-center">
        <thead>
          <tr>
            <th className="bg-slate-100 border border-slate-300 px-2 py-1 font-medium text-slate-800">
              #
            </th>
            <th className="bg-blue-900 text-white border border-slate-300 px-2 py-1 font-semibold">
              연소모드
            </th>
            <th className="bg-blue-900 text-white border border-slate-300 px-2 py-1 font-semibold">
              지속시간
            </th>
          </tr>
        </thead>
        <tbody>
          {modes.map((mode, i) => (
            <tr key={i}>
              <td className="bg-yellow-50 border border-slate-300 px-2 py-1 font-medium text-slate-800">
                {i + 1}
              </td>
              <td className="border border-slate-300 px-2 py-1 text-slate-700">
                {mode}
              </td>
              <td className="border border-slate-300 px-2 py-1 text-slate-700">
                {durations[i]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

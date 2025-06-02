import { useQuery } from "@tanstack/react-query";

interface DirectionDetailsData {
  direction: string;
  division: string;
  nbrProjet: number;
  daoNonEncoreRecu: number;
  enCoursDeVerificationParLeSM: number;
  nonEncorePublie: number;
  phaseDesoumission: number;
  seanceAOEnCours: number;
  approbationEnCours: number;
  visaEnCours: number;
  notificationEnCours: number;
  osEnCoursDElaboration: number;
  osNotifie: number;
}

export default function DirectionDetailsTable() {
  const { data: detailsData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/direction-details"],
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-2">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const tableData: DirectionDetailsData[] = detailsData || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Détails par Direction</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="border border-slate-300 px-3 py-3 text-left font-semibold">Direction</th>
              <th className="border border-slate-300 px-3 py-3 text-left font-semibold">Division</th>
              <th className="border border-slate-300 px-3 py-3 text-center font-semibold">NBR Projet</th>
              <th className="border border-slate-300 px-3 py-3 text-center font-semibold">DAO Non Encore Reçu</th>
              <th className="border border-slate-300 px-3 py-3 text-center font-semibold">En cours de Vérification par le SM</th>
              <th className="border border-slate-300 px-3 py-3 text-center font-semibold">Non Encore Publié</th>
              <th className="border border-slate-300 px-3 py-3 text-center font-semibold">Phase de soumission</th>
              <th className="border border-slate-300 px-3 py-3 text-center font-semibold">Séance AO en cours</th>
              <th className="border border-slate-300 px-3 py-3 text-center font-semibold">Approbation en cours</th>
              <th className="border border-slate-300 px-3 py-3 text-center font-semibold">Visa en cours</th>
              <th className="border border-slate-300 px-3 py-3 text-center font-semibold">Notification en cours</th>
              <th className="border border-slate-300 px-3 py-3 text-center font-semibold">OS en cours d'élaboration</th>
              <th className="border border-slate-300 px-3 py-3 text-center font-semibold">OS Notifié</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-slate-50 hover:bg-slate-100" : "bg-white hover:bg-slate-50"}>
                <td className="border border-slate-300 px-3 py-2 font-medium text-slate-900">
                  {row.direction}
                </td>
                <td className="border border-slate-300 px-3 py-2 font-medium text-slate-700">
                  {row.division}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                  {row.nbrProjet}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                  {row.daoNonEncoreRecu}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                  {row.enCoursDeVerificationParLeSM}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                  {row.nonEncorePublie}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                  {row.phaseDesoumission}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                  {row.seanceAOEnCours}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                  {row.approbationEnCours}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                  {row.visaEnCours}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                  {row.notificationEnCours}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                  {row.osEnCoursDElaboration}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                  {row.osNotifie}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
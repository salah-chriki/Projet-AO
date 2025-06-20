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
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-6 text-gray-900">Détails par Direction</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Direction</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Division</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">NBR Projet</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">DAO Non Encore Reçu</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">En cours de Vérification par le SM</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Non Encore Publié</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Phase de soumission</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Séance AO en cours</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Approbation en cours</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Visa en cours</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Notification en cours</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">OS en cours d'élaboration</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">OS Notifié</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {tableData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">
                  {row.direction}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-700 border border-gray-300">
                  {row.division}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700 border border-gray-300">
                  {row.nbrProjet}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700 border border-gray-300">
                  {row.daoNonEncoreRecu}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700 border border-gray-300">
                  {row.enCoursDeVerificationParLeSM}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700 border border-gray-300">
                  {row.nonEncorePublie}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700 border border-gray-300">
                  {row.phaseDesoumission}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700 border border-gray-300">
                  {row.seanceAOEnCours}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700 border border-gray-300">
                  {row.approbationEnCours}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700 border border-gray-300">
                  {row.visaEnCours}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700 border border-gray-300">
                  {row.notificationEnCours}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700 border border-gray-300">
                  {row.osEnCoursDElaboration}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700 border border-gray-300">
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
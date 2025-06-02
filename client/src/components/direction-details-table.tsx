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

  const tableData: DirectionDetailsData[] = detailsData || [
    { direction: "DSI", division: "DSI", nbrProjet: 6, daoNonEncoreRecu: 3, enCoursDeVerificationParLeSM: 1, nonEncorePublie: 0, phaseDesoumission: 2, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "", division: "DRHS", nbrProjet: 3, daoNonEncoreRecu: 3, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "DAF", division: "DF", nbrProjet: 0, daoNonEncoreRecu: 0, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "", division: "DCSP", nbrProjet: 0, daoNonEncoreRecu: 0, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "", division: "DSA", nbrProjet: 2, daoNonEncoreRecu: 2, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "DPPAV", division: "DPV", nbrProjet: 0, daoNonEncoreRecu: 0, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "", division: "DCPGOV", nbrProjet: 0, daoNonEncoreRecu: 0, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "", division: "DPPA", nbrProjet: 0, daoNonEncoreRecu: 0, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "", division: "DSSMAA", nbrProjet: 0, daoNonEncoreRecu: 0, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "DCDA", division: "DIC", nbrProjet: 0, daoNonEncoreRecu: 0, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "", division: "DT", nbrProjet: 3, daoNonEncoreRecu: 3, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "DIL", division: "DPRV", nbrProjet: 0, daoNonEncoreRecu: 0, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "", division: "DERSP", nbrProjet: 0, daoNonEncoreRecu: 0, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "", division: "DERAI", nbrProjet: 0, daoNonEncoreRecu: 0, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "DERAI", division: "DR", nbrProjet: 0, daoNonEncoreRecu: 0, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "", division: "DCC", nbrProjet: 0, daoNonEncoreRecu: 0, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 },
    { direction: "DCGAI", division: "DCGAI", nbrProjet: 0, daoNonEncoreRecu: 0, enCoursDeVerificationParLeSM: 0, nonEncorePublie: 0, phaseDesoumission: 0, seanceAOEnCours: 0, approbationEnCours: 0, visaEnCours: 0, notificationEnCours: 0, osEnCoursDElaboration: 0, osNotifie: 0 }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Détails par Direction</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border border-gray-300 px-2 py-2 text-left font-medium">Direction</th>
              <th className="border border-gray-300 px-2 py-2 text-left font-medium">Division</th>
              <th className="border border-gray-300 px-2 py-2 text-center font-medium">NBR Projet</th>
              <th className="border border-gray-300 px-2 py-2 text-center font-medium">DAO Non Encore Reçu</th>
              <th className="border border-gray-300 px-2 py-2 text-center font-medium">En cours de Vérification par le SM</th>
              <th className="border border-gray-300 px-2 py-2 text-center font-medium">Non Encore Publié</th>
              <th className="border border-gray-300 px-2 py-2 text-center font-medium">Phase de soumission</th>
              <th className="border border-gray-300 px-2 py-2 text-center font-medium">Séance AO en cours</th>
              <th className="border border-gray-300 px-2 py-2 text-center font-medium">Approbation en cours</th>
              <th className="border border-gray-300 px-2 py-2 text-center font-medium">Visa en cours</th>
              <th className="border border-gray-300 px-2 py-2 text-center font-medium">Notification en cours</th>
              <th className="border border-gray-300 px-2 py-2 text-center font-medium">OS en cours d'élaboration</th>
              <th className="border border-gray-300 px-2 py-2 text-center font-medium">OS Notifié</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-orange-100" : "bg-orange-50"}>
                <td className="border border-gray-300 px-2 py-1 font-medium text-gray-900">
                  {row.direction}
                </td>
                <td className="border border-gray-300 px-2 py-1 font-medium text-gray-900">
                  {row.division}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {row.nbrProjet}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {row.daoNonEncoreRecu}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {row.enCoursDeVerificationParLeSM}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {row.nonEncorePublie}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {row.phaseDesoumission}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {row.seanceAOEnCours}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {row.approbationEnCours}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {row.visaEnCours}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {row.notificationEnCours}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {row.osEnCoursDElaboration}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
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
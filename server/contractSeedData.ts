import { storage } from "./storage";

export async function seedContractData() {
  try {
    console.log("Creating sample contract management data...");

    // Get existing tenders to create contracts for
    const tenders = await storage.getAllTenders();
    const completedTenders = tenders.filter((t: any) => t.status === "completed" || t.currentPhase === 3);
    
    if (completedTenders.length === 0) {
      console.log("No completed tenders found, creating sample contracts...");
      // Create contracts for the first few tenders regardless of status
      const sampleTenders = tenders.slice(0, 3);
      
      for (const tender of sampleTenders) {
        // Create contract
        const contract = await storage.createContract({
          tenderId: tender.id,
          contractorName: getContractorName(tender.title),
          amount: tender.amount || "100000",
          dateSigned: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          status: "active"
        });

        console.log(`Created contract for tender: ${tender.title}`);

        // Create invoices for this contract
        const invoice1 = await storage.createInvoice({
          contractId: contract.id,
          fileName: `invoice_${contract.id.slice(0, 8)}_001.pdf`,
          originalFileName: `Facture_${getContractorName(tender.title)}_001.pdf`,
          status: "approved",
          amount: (Number(contract.amount) * 0.4).toString(),
          submissionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          approvedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
        });

        const invoice2 = await storage.createInvoice({
          contractId: contract.id,
          fileName: `invoice_${contract.id.slice(0, 8)}_002.pdf`,
          originalFileName: `Facture_${getContractorName(tender.title)}_002.pdf`,
          status: "pending",
          amount: (Number(contract.amount) * 0.6).toString(),
          submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        });

        // Create orders
        await storage.createOrder({
          type: "OS",
          contractId: contract.id,
          dateIssued: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          issuedById: "admin1",
          description: `Ordre de service - Début des travaux pour ${tender.title}`,
          amount: contract.amount,
          status: "active"
        });

        await storage.createOrder({
          type: "Reprise",
          contractId: contract.id,
          dateIssued: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          issuedById: "admin1",
          description: "Reprise des travaux après suspension technique",
          status: "active"
        });

        // Create receptions
        await storage.createReception({
          contractId: contract.id,
          type: "Provisional",
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          status: "approved",
          comments: "Réception provisoire effectuée avec quelques réserves mineures",
          receivedById: "ce1"
        });

        await storage.createReception({
          contractId: contract.id,
          type: "Final",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: "pending",
          comments: "En attente de la levée des réserves",
          receivedById: "ce1"
        });

        // Create payments
        await storage.createPayment({
          invoiceId: invoice1.id,
          amount: invoice1.amount!,
          status: "completed",
          paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          processedById: "admin1",
          paymentReference: `PAY-${Date.now()}-001`
        });

        await storage.createPayment({
          invoiceId: invoice2.id,
          amount: invoice2.amount!,
          status: "pending",
          processedById: "admin1",
          paymentReference: `PAY-${Date.now()}-002`
        });

        console.log(`Created complete contract lifecycle for: ${tender.title}`);
      }
    }

    console.log("Sample contract management data created successfully!");
    
  } catch (error) {
    console.error("Error creating sample contract data:", error);
  }
}

function getContractorName(tenderTitle: string): string {
  const contractors = [
    "Entreprise Martin SARL",
    "BTP Solutions SAS", 
    "Constructions Dubois",
    "Rénovations Pro EURL",
    "Bâtiment Expert SA",
    "Travaux Publics Moderne",
    "Infrastructure Plus SARL"
  ];
  
  // Simple hash to consistently assign contractor based on title
  const hash = tenderTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return contractors[hash % contractors.length];
}
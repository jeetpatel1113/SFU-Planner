import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { scrapeAllCourses } from "./scraper";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

/**
 * Scheduled function that runs every day at 3:00 AM Pacific Time.
 * Scrapes the SFU Course Outlines API and updates the Firestore catalog.
 */
export const updateSFUCourseCatalog = functions.pubsub
  .schedule("0 3 * * *")
  .timeZone("America/Vancouver")
  .onRun(async (context) => {
    console.log("Starting daily SFU Course Catalog update...");
    
    // For SFU, we need current year and term. 
    // SFU terms: Spring (1), Summer (4), Fall (7)
    // E.g., 2026 fall = "2026/fall"
    // Since we don't have a complex term calculator in this script, we default to the current active term based on date.
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = date.getMonth() + 1; // 1-12
    let term = "fall";
    if (month >= 1 && month <= 4) term = "spring";
    else if (month >= 5 && month <= 8) term = "summer";
    
    try {
      const courses = await scrapeAllCourses(year, term);
      
      if (courses.length > 0) {
        // Save the full catalog to Firestore under a single document to save read costs
        // If the payload exceeds 1MB (Firestore limit), we would need to split it by department
        // Assuming we strip it down or split it:
        
        // Let's store them in a 'catalog' collection, one document per department to be safe from the 1MB limit
        const deptMap = new Map<string, any[]>();
        courses.forEach(c => {
          const arr = deptMap.get(c.department) || [];
          arr.push(c);
          deptMap.set(c.department, arr);
        });

        const batch = db.batch();
        const catalogRef = db.collection("catalog").doc(year + "_" + term);
        
        // Write index/metadata
        batch.set(catalogRef, {
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          totalCourses: courses.length,
          term: `${year} ${term}`
        });

        // Write department subcollections
        for (const [dept, deptCourses] of deptMap.entries()) {
          const deptRef = catalogRef.collection("departments").doc(dept);
          batch.set(deptRef, { courses: deptCourses });
        }

        await batch.commit();
        console.log(`Successfully updated ${courses.length} courses!`);
      } else {
        console.warn("No courses were scraped. Check API connectivity.");
      }
    } catch (error) {
      console.error("Critical error during course scraping:", error);
    }
    
    return null;
  });

// HTTP Callable for manual trigger testing
export const triggerSFUCatalogUpdate = functions.https.onRequest(async (req, res) => {
  console.log("Manual trigger initiated");
  try {
    const year = req.query.year as string || "2026";
    const term = req.query.term as string || "fall";
    const courses = await scrapeAllCourses(year, term);
    res.json({ success: true, count: courses.length, sample: courses.slice(0, 3) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

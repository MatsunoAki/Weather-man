import { Router } from "express";
import Users from "../models/user";
import  { authMiddleware, AuthenticatedRequest } from "../middleware/authMiddleware";  

const router = Router();
// GET user preferences 
router.get('/preferences', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const user = await Users.findByPk(req.user?.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { homeCity, useGPS, morningAlert, eveningAlert, alertOnSuddenChange } = user;
        res.json({ homeCity, useGPS, morningAlert, eveningAlert, alertOnSuddenChange });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user preferences" });
    }
});

// UPDATE user preferences - Change .get to .put here!
router.put('/update-preferences', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const { homeCity, useGPS, morningAlert, eveningAlert, alertOnSuddenChange } = req.body;
        
        await Users.update(
            { homeCity, useGPS, morningAlert, eveningAlert, alertOnSuddenChange },
            { where: { id: req.user?.userId } } // Uses your auth middleware ID
        );

        res.json({ message: "User preferences updated successfully" });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Error updating user preferences" });
    }
});
export default router;
import { sql } from "../config/initailiseDatabase.js";

// POST /api/auth/logoutuser
export const logoutUser = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Update user’s status to inactive
    await sql`
      UPDATE users
      SET isActive = FALSE
      WHERE user_id = ${user_id};
    `;

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

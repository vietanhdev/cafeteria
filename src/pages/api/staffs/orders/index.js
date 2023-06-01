import { db } from "@/lib/firebase";
import {
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { ORDER_STATUS_TYPE_TO_ORDER_STATUS } from "@/lib/order_status";

export default async function handler(req, res) {
  console.log("req.url: ", req.url);

  // Check authentication
  const URL_PATH = "/api/staffs/orders";
  const session = await getServerSession(req, res, authOptions);
  const currentUser = session?.user;
  if (!currentUser) {
    return res.status(401).json({ error: "Login is required" });
  }
  if (!currentUser?.isStaff) {
    return res.status(401).json({ error: "Staff is required" });
  }
  if (req.method === "GET") {
    const statusType = req.query.status_type;
    if (statusType) return await getOrdersByStatusType(req, res, statusType);
    return await getAllOrders(req, res);
  }

  async function getAllOrders(req, res) {
    const q = query(
      collection(db, "orders"),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    // Return empty array if no order found
    if ((await getDocs(q)).empty) {
      return res.status(200).json({ success: true, data: {} });
    }

    // Return order data
    const docs = (await getDocs(q)).docs;
    const data = docs.map((doc) => {
      return { ...doc.data(), id: doc.id };
    });
    return res.status(200).json({ success: true, data: data });
  }

  async function getOrdersByStatusType(req, res, statusType) {
    const q = query(
      collection(db, "orders"),
      where("status", "in", ORDER_STATUS_TYPE_TO_ORDER_STATUS[statusType]),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    // Return empty array if no order found
    if ((await getDocs(q)).empty) {
      return res.status(200).json({ success: true, data: {} });
    }

    // Return order data
    const docs = (await getDocs(q)).docs;
    const data = docs.map((doc) => {
      return { ...doc.data(), id: doc.id };
    });
    return res.status(200).json({ success: true, data: data });
  }
}

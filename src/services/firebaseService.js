import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/config";
import {
  DEFAULT_HALL,
  DEFAULT_PRICING,
  DEFAULT_FACILITIES,
  DEFAULT_GALLERY,
  DEFAULT_RULES,
  DEFAULT_REVIEWS
} from "./defaultData";

// Helper for local storage persistence as robust offline fallback / initial sync
const storageKey = (key) => `chb_${key}`;
const getLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(storageKey(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const setLocal = (key, data) => {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(data));
  } catch (e) {
    console.warn("Local storage write error:", e);
  }
};

// ==========================================
// 1. HALL DETAILS
// ==========================================
export async function getHallInfo() {
  try {
    const docRef = doc(db, "hall", "main");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      setLocal("hall", data);
      return data;
    } else {
      // Auto seed default into Firestore
      await setDoc(docRef, { ...DEFAULT_HALL, updatedAt: serverTimestamp() }).catch(() => {});
      setLocal("hall", DEFAULT_HALL);
      return DEFAULT_HALL;
    }
  } catch (err) {
    console.warn("Firestore getHallInfo fallback:", err.message);
    return getLocal("hall", DEFAULT_HALL);
  }
}

export async function updateHallInfo(hallData) {
  try {
    const docRef = doc(db, "hall", "main");
    await setDoc(docRef, { ...hallData, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn("Firestore updateHallInfo error:", err.message);
  }
  setLocal("hall", hallData);
  return hallData;
}

// ==========================================
// 2. PRICING
// ==========================================
export async function getPricingInfo() {
  try {
    const docRef = doc(db, "pricing", "main");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      setLocal("pricing", data);
      return data;
    } else {
      await setDoc(docRef, { ...DEFAULT_PRICING, updatedAt: serverTimestamp() }).catch(() => {});
      setLocal("pricing", DEFAULT_PRICING);
      return DEFAULT_PRICING;
    }
  } catch (err) {
    console.warn("Firestore getPricingInfo fallback:", err.message);
    return getLocal("pricing", DEFAULT_PRICING);
  }
}

export async function updatePricingInfo(pricingData) {
  try {
    const docRef = doc(db, "pricing", "main");
    await setDoc(docRef, { ...pricingData, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn("Firestore updatePricingInfo error:", err.message);
  }
  setLocal("pricing", pricingData);
  return pricingData;
}

// ==========================================
// 3. FACILITIES
// ==========================================
export async function getFacilitiesList() {
  try {
    const colRef = collection(db, "facilities");
    const snap = await getDocs(query(colRef, orderBy("order", "asc")));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLocal("facilities", items);
      return items;
    } else {
      // Seed default facilities
      for (const item of DEFAULT_FACILITIES) {
        await setDoc(doc(db, "facilities", item.id), item).catch(() => {});
      }
      setLocal("facilities", DEFAULT_FACILITIES);
      return DEFAULT_FACILITIES;
    }
  } catch (err) {
    console.warn("Firestore getFacilitiesList fallback:", err.message);
    return getLocal("facilities", DEFAULT_FACILITIES);
  }
}

export async function saveFacilityItem(facility) {
  const current = getLocal("facilities", DEFAULT_FACILITIES);
  const fid = facility.id || `fac-${Date.now()}`;
  const payload = { ...facility, id: fid };
  try {
    await setDoc(doc(db, "facilities", fid), payload, { merge: true });
  } catch (e) {
    console.warn("Firestore saveFacilityItem error:", e.message);
  }
  const idx = current.findIndex(f => f.id === fid);
  const updated = idx >= 0 ? current.map(f => f.id === fid ? payload : f) : [...current, payload];
  setLocal("facilities", updated);
  return payload;
}

export async function removeFacilityItem(facilityId) {
  try {
    await deleteDoc(doc(db, "facilities", facilityId));
  } catch (e) {
    console.warn("Firestore removeFacilityItem error:", e.message);
  }
  const current = getLocal("facilities", DEFAULT_FACILITIES);
  const updated = current.filter(f => f.id !== facilityId);
  setLocal("facilities", updated);
  return true;
}

// ==========================================
// 4. GALLERY
// ==========================================
export async function getGalleryList() {
  try {
    const colRef = collection(db, "gallery");
    const snap = await getDocs(query(colRef, orderBy("order", "asc")));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLocal("gallery", items);
      return items;
    } else {
      for (const item of DEFAULT_GALLERY) {
        await setDoc(doc(db, "gallery", item.id), item).catch(() => {});
      }
      setLocal("gallery", DEFAULT_GALLERY);
      return DEFAULT_GALLERY;
    }
  } catch (err) {
    console.warn("Firestore getGalleryList fallback:", err.message);
    return getLocal("gallery", DEFAULT_GALLERY);
  }
}

export async function addGalleryItem(item) {
  const current = getLocal("gallery", DEFAULT_GALLERY);
  const gid = item.id || `gal-${Date.now()}`;
  const payload = { ...item, id: gid, createdAt: new Date().toISOString() };
  try {
    await setDoc(doc(db, "gallery", gid), payload);
  } catch (e) {
    console.warn("Firestore addGalleryItem error:", e.message);
  }
  const updated = [payload, ...current];
  setLocal("gallery", updated);
  return payload;
}

export async function deleteGalleryItem(id) {
  try {
    await deleteDoc(doc(db, "gallery", id));
  } catch (e) {
    console.warn("Firestore deleteGalleryItem error:", e.message);
  }
  const current = getLocal("gallery", DEFAULT_GALLERY);
  const updated = current.filter(g => g.id !== id);
  setLocal("gallery", updated);
  return true;
}

// ==========================================
// 5. BOOKINGS & AVAILABILITY
// ==========================================
export async function getAllBookings() {
  try {
    const colRef = collection(db, "bookings");
    const snap = await getDocs(query(colRef, orderBy("createdAt", "desc")));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setLocal("bookings", list);
    return list;
  } catch (err) {
    console.warn("Firestore getAllBookings fallback:", err.message);
    return getLocal("bookings", []);
  }
}

export async function getUserBookings(userId) {
  try {
    const colRef = collection(db, "bookings");
    const snap = await getDocs(query(colRef, where("userId", "==", userId)));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort descending by created date
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  } catch (err) {
    console.warn("Firestore getUserBookings fallback:", err.message);
    const all = getLocal("bookings", []);
    return all.filter(b => b.userId === userId);
  }
}

// Check date overlap logic: date format "YYYY-MM-DD"
export function isRangeOverlapping(startA, endA, startB, endB) {
  return !(endA < startB || startA > endB);
}

export async function checkDateAvailability(startDate, endDate, excludeBookingId = null) {
  const bookings = await getAllBookings();
  const blockedDates = await getBlockedDatesList();
  const maintenance = await getMaintenanceList();

  // 1. Check approved bookings
  const conflictingBooking = bookings.find(b => {
    if (excludeBookingId && b.id === excludeBookingId) return false;
    if (b.status === "approved") {
      return isRangeOverlapping(startDate, endDate, b.startDate, b.endDate);
    }
    return false;
  });

  if (conflictingBooking) {
    return {
      available: false,
      reason: `The hall is already booked for ${conflictingBooking.eventType || "an event"} from ${conflictingBooking.startDate} to ${conflictingBooking.endDate}.`
    };
  }

  // 2. Check blocked dates
  const conflictingBlocked = blockedDates.find(b => {
    return isRangeOverlapping(startDate, endDate, b.startDate, b.endDate);
  });

  if (conflictingBlocked) {
    return {
      available: false,
      reason: `Selected dates are reserved/blocked by administration: ${conflictingBlocked.reason || "Hall unavailable"}.`
    };
  }

  // 3. Check maintenance
  const conflictingMaint = maintenance.find(m => {
    if (m.status === "completed") return false;
    return isRangeOverlapping(startDate, endDate, m.startDate, m.endDate);
  });

  if (conflictingMaint) {
    return {
      available: false,
      reason: `Hall maintenance is scheduled during this period: ${conflictingMaint.reason || "Facility upgrade"}.`
    };
  }

  return { available: true };
}

export async function submitBookingRequest(bookingData) {
  // Validate availability first
  const check = await checkDateAvailability(bookingData.startDate, bookingData.endDate);
  if (!check.available) {
    throw new Error(check.reason);
  }

  const bookingId = `BK-${Date.now().toString().slice(-6)}`;
  const payload = {
    ...bookingData,
    bookingRef: bookingId,
    status: "pending", // PRD: Pending by default until admin approves
    paymentStatus: "not_paid",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, "bookings"), payload);
    payload.id = docRef.id;
  } catch (err) {
    console.warn("Firestore submitBookingRequest write fallback:", err.message);
    payload.id = `temp-${Date.now()}`;
  }

  // Update local cache
  const all = getLocal("bookings", []);
  setLocal("bookings", [payload, ...all]);

  // Create automatic notification for user
  await sendNotification(
    payload.userId,
    "Booking Request Submitted",
    `Your request for ${payload.eventType} (${payload.startDate} to ${payload.endDate}) has been submitted and is awaiting owner approval.`,
    "info"
  );

  return payload;
}

export async function updateBookingStatus(bookingId, newStatus, adminNotes = "", reason = "") {
  const current = getLocal("bookings", []);
  let targetBooking = null;

  try {
    const docRef = doc(db, "bookings", bookingId);
    await updateDoc(docRef, {
      status: newStatus,
      adminNotes: adminNotes || "",
      cancellationReason: reason || "",
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn("Firestore updateBookingStatus error:", e.message);
  }

  const updated = current.map(b => {
    if (b.id === bookingId) {
      targetBooking = {
        ...b,
        status: newStatus,
        adminNotes: adminNotes || b.adminNotes,
        cancellationReason: reason || b.cancellationReason,
        updatedAt: new Date().toISOString()
      };
      return targetBooking;
    }
    return b;
  });

  setLocal("bookings", updated);

  // Send contextual notification to user
  if (targetBooking && targetBooking.userId) {
    let title = "Booking Status Update";
    let message = `Your booking for ${targetBooking.eventType} status has changed to ${newStatus.toUpperCase()}.`;
    let type = "info";

    if (newStatus === "approved") {
      title = "Booking Approved! 🎉";
      message = `Congratulations! Your booking for ${targetBooking.startDate} to ${targetBooking.endDate} has been APPROVED by the hall owner.`;
      type = "success";
    } else if (newStatus === "rejected") {
      title = "Booking Request Declined";
      message = `Your booking request was declined. Reason: ${reason || "Dates unavailable or criteria not met"}.`;
      type = "warning";
    } else if (newStatus === "cancelled") {
      title = "Booking Cancelled";
      message = `Your booking for ${targetBooking.startDate} has been marked as cancelled.`;
      type = "danger";
    }

    await sendNotification(targetBooking.userId, title, message, type);
  }

  return targetBooking;
}

export async function updateBookingPayment(bookingId, paymentStatus, transactionRef = "") {
  const current = getLocal("bookings", []);
  try {
    const docRef = doc(db, "bookings", bookingId);
    await updateDoc(docRef, { paymentStatus, transactionRef, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn("Firestore updateBookingPayment error:", e.message);
  }

  const updated = current.map(b => b.id === bookingId ? { ...b, paymentStatus, transactionRef } : b);
  setLocal("bookings", updated);
  return true;
}

// ==========================================
// 6. BLOCKED DATES & MAINTENANCE
// ==========================================
export async function getBlockedDatesList() {
  try {
    const colRef = collection(db, "blockedDates");
    const snap = await getDocs(colRef);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setLocal("blockedDates", list);
    return list;
  } catch (e) {
    return getLocal("blockedDates", []);
  }
}

export async function addBlockedDate(data) {
  const payload = { ...data, createdAt: new Date().toISOString() };
  try {
    const docRef = await addDoc(collection(db, "blockedDates"), payload);
    payload.id = docRef.id;
  } catch (e) {
    payload.id = `block-${Date.now()}`;
  }
  const current = getLocal("blockedDates", []);
  setLocal("blockedDates", [...current, payload]);
  return payload;
}

export async function removeBlockedDate(id) {
  try {
    await deleteDoc(doc(db, "blockedDates", id));
  } catch (e) {}
  const current = getLocal("blockedDates", []);
  setLocal("blockedDates", current.filter(b => b.id !== id));
  return true;
}

export async function getMaintenanceList() {
  try {
    const colRef = collection(db, "maintenance");
    const snap = await getDocs(colRef);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setLocal("maintenance", list);
    return list;
  } catch (e) {
    return getLocal("maintenance", []);
  }
}

export async function addMaintenanceSlot(data) {
  const payload = { ...data, status: "scheduled", createdAt: new Date().toISOString() };
  try {
    const docRef = await addDoc(collection(db, "maintenance"), payload);
    payload.id = docRef.id;
  } catch (e) {
    payload.id = `maint-${Date.now()}`;
  }
  const current = getLocal("maintenance", []);
  setLocal("maintenance", [...current, payload]);
  return payload;
}

export async function removeMaintenanceSlot(id) {
  try {
    await deleteDoc(doc(db, "maintenance", id));
  } catch (e) {}
  const current = getLocal("maintenance", []);
  setLocal("maintenance", current.filter(m => m.id !== id));
  return true;
}

// ==========================================
// 7. NOTIFICATIONS
// ==========================================
export async function getUserNotifications(userId) {
  try {
    const colRef = collection(db, "notifications");
    const snap = await getDocs(query(colRef, where("userId", "==", userId)));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    setLocal(`notifs_${userId}`, list);
    return list;
  } catch (e) {
    return getLocal(`notifs_${userId}`, [
      {
        id: "n-welcome",
        title: "Welcome to Grand Horizon",
        message: "Your account has been registered. You can check availability and book dates online.",
        type: "success",
        read: false,
        createdAt: new Date().toISOString()
      }
    ]);
  }
}

export async function sendNotification(userId, title, message, type = "info") {
  const payload = {
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };
  try {
    const docRef = await addDoc(collection(db, "notifications"), payload);
    payload.id = docRef.id;
  } catch (e) {
    payload.id = `notif-${Date.now()}`;
  }
  const current = getLocal(`notifs_${userId}`, []);
  setLocal(`notifs_${userId}`, [payload, ...current]);
  return payload;
}

export async function markNotificationRead(userId, notifId) {
  try {
    await updateDoc(doc(db, "notifications", notifId), { read: true });
  } catch (e) {}
  const current = getLocal(`notifs_${userId}`, []);
  const updated = current.map(n => n.id === notifId ? { ...n, read: true } : n);
  setLocal(`notifs_${userId}`, updated);
  return true;
}

// ==========================================
// 8. REVIEWS & TESTIMONIALS
// ==========================================
export async function getReviewsList(onlyApproved = true) {
  try {
    const colRef = collection(db, "reviews");
    const q = onlyApproved ? query(colRef, where("status", "==", "approved")) : colRef;
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLocal("reviews", items);
      return items;
    } else {
      for (const item of DEFAULT_REVIEWS) {
        await setDoc(doc(db, "reviews", item.id), item).catch(() => {});
      }
      setLocal("reviews", DEFAULT_REVIEWS);
      return onlyApproved ? DEFAULT_REVIEWS.filter(r => r.status === "approved") : DEFAULT_REVIEWS;
    }
  } catch (e) {
    const cached = getLocal("reviews", DEFAULT_REVIEWS);
    return onlyApproved ? cached.filter(r => r.status === "approved") : cached;
  }
}

export async function submitReviewItem(reviewData) {
  const payload = {
    ...reviewData,
    status: "pending", // PRD: pending moderation
    createdAt: new Date().toISOString()
  };
  try {
    const docRef = await addDoc(collection(db, "reviews"), payload);
    payload.id = docRef.id;
  } catch (e) {
    payload.id = `rev-${Date.now()}`;
  }
  const current = getLocal("reviews", DEFAULT_REVIEWS);
  setLocal("reviews", [payload, ...current]);
  return payload;
}

export async function updateReviewStatus(reviewId, status, featured = false) {
  try {
    await updateDoc(doc(db, "reviews", reviewId), { status, featured });
  } catch (e) {}
  const current = getLocal("reviews", DEFAULT_REVIEWS);
  const updated = current.map(r => r.id === reviewId ? { ...r, status, featured } : r);
  setLocal("reviews", updated);
  return true;
}

export async function deleteReviewItem(reviewId) {
  try {
    await deleteDoc(doc(db, "reviews", reviewId));
  } catch (e) {}
  const current = getLocal("reviews", DEFAULT_REVIEWS);
  setLocal("reviews", current.filter(r => r.id !== reviewId));
  return true;
}

// ==========================================
// 9. WEBSITE POLICIES & RULES
// ==========================================
export async function getRulesAndPolicies() {
  try {
    const docRef = doc(db, "settings", "policies");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().rules;
    }
  } catch (e) {}
  return getLocal("rules", DEFAULT_RULES);
}

export async function updateRulesAndPolicies(rulesList) {
  try {
    await setDoc(doc(db, "settings", "policies"), { rules: rulesList }, { merge: true });
  } catch (e) {}
  setLocal("rules", rulesList);
  return rulesList;
}

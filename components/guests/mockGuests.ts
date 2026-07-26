import { Guest } from "./types"
function uuid() {
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

const now = new Date()

function daysAgo(n: number) {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export const mockGuests: Guest[] = [
  { id: uuid(), lastName: "Mukendi", middleName: "B.", firstName: "Danny", phone: "+243 99 123 4567", email: "danny.mukendi@example.com", address: "Avenue Kasa-Vubu 12", city: "Lubumbashi", province: "Haut-Katanga", country: "RD Congo", gender: "male", dateOfBirth: "1990-04-12", category: "Family", family: true, friends: false, colleagues: false, vip: false, witnesses: true, bridesmaids: 0, groomsmen: 1, children: false, tableNumber: 3, guestsCount: 2, rsvpStatus: "present", arrivalTime: "18:00", message: "Excited to celebrate!", qrCode: "QRCODE1", inviteCode: "INV-001", createdAt: daysAgo(40), updatedAt: daysAgo(10) },
  { id: uuid(), lastName: "Abigail", firstName: "Abigail", middleName: "N.", phone: "+243 81 555 0123", email: "abigail@example.com", address: "Quartier Kalubwe 4", city: "Lubumbashi", province: "Haut-Katanga", country: "RD Congo", gender: "female", dateOfBirth: "1992-11-02", category: "Friends", family: false, friends: true, colleagues: false, vip: false, witnesses: false, bridesmaids: 3, groomsmen: 0, children: false, tableNumber: 1, guestsCount: 1, rsvpStatus: "present", arrivalTime: "17:45", message: "See you soon!", qrCode: "QRCODE2", inviteCode: "INV-002", createdAt: daysAgo(38), updatedAt: daysAgo(8) },
  { id: uuid(), lastName: "Nsimba", firstName: "Kevin", middleName: "L.", phone: "+243 99 222 3344", email: "kevin.nsimba@example.com", address: "Route Mwepu 9", city: "Kolwezi", province: "Lualaba", country: "RD Congo", gender: "male", dateOfBirth: "1988-07-23", category: "Colleagues", family: false, friends: false, colleagues: true, vip: false, witnesses: false, bridesmaids: 0, groomsmen: 2, children: false, tableNumber: 4, guestsCount: 2, rsvpStatus: "pending", arrivalTime: null, message: "Will confirm soon", qrCode: "QRCODE3", inviteCode: "INV-003", createdAt: daysAgo(50), updatedAt: daysAgo(20) },
  { id: uuid(), lastName: "Grace", firstName: "Grace", middleName: "A.", phone: "+243 84 777 8899", email: "grace@example.com", address: "Immeuble 7, Rue 3", city: "Kolwezi", province: "Lualaba", country: "RD Congo", gender: "female", dateOfBirth: "1991-02-15", category: "VIP", family: false, friends: false, colleagues: false, vip: true, witnesses: false, bridesmaids: 1, groomsmen: 0, children: false, tableNumber: 2, guestsCount: 4, rsvpStatus: "present", arrivalTime: "17:30", message: "Honoured to attend", qrCode: "QRCODE4", inviteCode: "INV-004", createdAt: daysAgo(5), updatedAt: daysAgo(1) },
  // generate more realistic guests
  ...Array.from({ length: 26 }).map((_, i) => {
    const id = uuid()
    const firstNames = ["Marie", "Paul", "Jean", "Sophie", "Isabelle", "Marc", "Alice", "Thierry", "Olivia", "Ange", "Emmanuel", "Lucie", "Philippe", "Amina", "Hugo"]
    const lastNames = ["Kabila", "Mboyo", "Kitenge", "Lukusa", "Mwana", "Kambale", "Mwamba", "Kabongo", "Nzanzu", "Baleke"]
    const fn = firstNames[i % firstNames.length]
    const ln = lastNames[i % lastNames.length]
    const city = i % 3 === 0 ? "Lubumbashi" : i % 3 === 1 ? "Kolwezi" : "Likasi"
    const category = i % 6 === 0 ? "VIP" : i % 5 === 0 ? "Family" : i % 4 === 0 ? "Friends" : "Colleagues"
    const rsvpOptions: Array<"present" | "absent" | "pending" | "maybe"> = ["present", "absent", "pending", "maybe"]
    const rsvp = rsvpOptions[i % rsvpOptions.length]

    return {
      id,
      lastName: ln,
      firstName: fn,
      middleName: undefined,
      phone: `+243 99 ${1000 + i}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
      address: `${i + 1} Rue Centrale`,
      city,
      province: i % 2 === 0 ? "Haut-Katanga" : "Lualaba",
      country: "RD Congo",
      gender: (i % 2 === 0 ? "female" : "male") as "female" | "male",
      dateOfBirth: `198${(i % 10)}-0${(i % 9) + 1}-0${(i % 27) + 1}`,
      category,
      family: i % 5 === 0,
      friends: i % 4 === 0,
      colleagues: i % 3 === 0,
      vip: category === "VIP",
      witnesses: false,
      bridesmaids: 0,
      groomsmen: 0,
      children: i % 7 === 0,
      tableNumber: (i % 12) + 1,
      guestsCount: (i % 4) + 1,
      rsvpStatus: rsvp,
      arrivalTime: rsvp === "present" ? `18:${(10 + i) % 50}` : null,
      message: i % 8 === 0 ? "Félicitations aux mariés" : undefined,
      qrCode: `QRCODE-${i}`,
      inviteCode: `INV-${100 + i}`,
      createdAt: daysAgo(60 - i),
      updatedAt: daysAgo(10 - (i % 7)),
    }
  }),
]

export default mockGuests

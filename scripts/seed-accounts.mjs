import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("ERREUR: .env.local doit contenir NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const accounts = [
  { email: "dr.marrakchi@labo.tn",  password: "123456789", role: "doctor",      full_name: "Dr. Marrakchi" },
  { email: "shayma@labo.tn",        password: "123456789", role: "lab_admin",   full_name: "Shayma" },
  { email: "patient@labo.tn",       password: "123456789", role: "patient",     full_name: "Patient Test" },
  { email: "admin@labo.tn",         password: "123456789", role: "super_admin", full_name: "Super Admin" },
];

async function cleanAllData() {
  const tables = [
    "audit_logs",
    "notifications",
    "blocked_dates",
    "doctor_availability",
    "request_documents",
    "status_history",
    "appointments",
    "analysis_requests",
    "profiles",
  ];
  for (const t of tables) await admin.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
}

async function deleteExistingAuthUsers() {
  const { data: users } = await admin.auth.admin.listUsers();
  for (const u of users?.users ?? []) {
    if (u.email && accounts.some((a) => a.email === u.email)) {
      console.log(`  Suppression: ${u.email}`);
      await admin.auth.admin.deleteUser(u.id);
    }
  }
}

async function createAccount(acct) {
  console.log(`Création: ${acct.email} (${acct.role})...`);
  try {
    const { data, error } = await admin.auth.admin.createUser({
      email: acct.email,
      password: acct.password,
      email_confirm: true,
      app_metadata: { role: acct.role },
      user_metadata: { full_name: acct.full_name },
    });
    if (error) {
      console.error(`  ERREUR:`, JSON.stringify(error, null, 2));
      return;
    }
    const { error: pe } = await admin.from("profiles").insert({
      id: data.user.id, email: acct.email, role: acct.role, full_name: acct.full_name,
    });
    console.error(pe ? `  ERREUR profile: ${JSON.stringify(pe.message)}` : `  OK`);
  } catch (e) {
    console.error(`  EXCEPTION:`, e instanceof Error ? e.message : JSON.stringify(e));
  }
}

async function verify() {
  const { data: profiles } = await admin.from("profiles").select("email, role, full_name");
  console.log("\nVérification :");
  for (const p of profiles ?? []) console.log(`  ${p.email} → ${p.role} (${p.full_name})`);
}

async function main() {
  console.log("Nettoyage des données...");
  await cleanAllData();
  console.log("Suppression des comptes auth existants...");
  await deleteExistingAuthUsers();
  console.log("Création des nouveaux comptes...");
  for (const acct of accounts) await createAccount(acct);
  await verify();
}

main().catch(console.error);

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // If admin already exists, do not wipe existing production defects or sessions
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@urbaneye.gov.in' },
  });

  if (existingAdmin) {
    console.log('✅ Database already initialized with administrative hierarchy and accounts. Skipping full wipe.');
    return;
  }

  console.log('🌱 Seeding initial administrative hierarchy and government role accounts...');

  // Clean existing data for initial fresh seed
  await prisma.roadEvent.deleteMany();
  await prisma.busDeviceSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.district.deleteMany();
  await prisma.state.deleteMany();

  // 1. Create States
  const mh = await prisma.state.create({
    data: {
      code: 'MH',
      name: 'Maharashtra',
      centerLat: 19.7515,
      centerLon: 75.7139,
    },
  });

  const ka = await prisma.state.create({
    data: {
      code: 'KA',
      name: 'Karnataka',
      centerLat: 15.3173,
      centerLon: 75.7139,
    },
  });

  const dl = await prisma.state.create({
    data: {
      code: 'DL',
      name: 'Delhi NCT',
      centerLat: 28.7041,
      centerLon: 77.1025,
    },
  });

  const pb = await prisma.state.create({
    data: {
      code: 'PB',
      name: 'Punjab',
      centerLat: 31.1471,
      centerLon: 75.3412,
    },
  });

  // 2. Create Districts
  const mumbaiSuburban = await prisma.district.create({
    data: {
      code: 'MUM_SUB',
      name: 'Mumbai Suburban',
      stateId: mh.id,
      centerLat: 19.0760,
      centerLon: 72.8777,
      minLat: 18.90,
      maxLat: 19.27,
      minLon: 72.77,
      maxLon: 72.98,
    },
  });

  const pune = await prisma.district.create({
    data: {
      code: 'PUNE',
      name: 'Pune',
      stateId: mh.id,
      centerLat: 18.5204,
      centerLon: 73.8567,
      minLat: 18.35,
      maxLat: 18.65,
      minLon: 73.70,
      maxLon: 74.05,
    },
  });

  const blrUrban = await prisma.district.create({
    data: {
      code: 'BLR_URB',
      name: 'Bengaluru Urban',
      stateId: ka.id,
      centerLat: 12.9716,
      centerLon: 77.5946,
      minLat: 12.80,
      maxLat: 13.15,
      minLon: 77.45,
      maxLon: 77.75,
    },
  });

  const mysuru = await prisma.district.create({
    data: {
      code: 'MYSURU',
      name: 'Mysuru',
      stateId: ka.id,
      centerLat: 12.2958,
      centerLon: 76.6394,
      minLat: 12.15,
      maxLat: 12.45,
      minLon: 76.50,
      maxLon: 76.80,
    },
  });

  const newDelhi = await prisma.district.create({
    data: {
      code: 'NEW_DELHI',
      name: 'New Delhi',
      stateId: dl.id,
      centerLat: 28.6139,
      centerLon: 77.2090,
      minLat: 28.50,
      maxLat: 28.70,
      minLon: 77.10,
      maxLon: 77.30,
    },
  });

  // Punjab Districts (Kapurthala, Jalandhar, Ludhiana)
  const kapurthala = await prisma.district.create({
    data: {
      code: 'KAPURTHALA',
      name: 'Kapurthala',
      stateId: pb.id,
      centerLat: 31.2536,
      centerLon: 75.7037, // NH-44 Corridor
      minLat: 31.10,
      maxLat: 31.60,
      minLon: 75.20,
      maxLon: 76.00,
    },
  });

  const jalandhar = await prisma.district.create({
    data: {
      code: 'JALANDHAR',
      name: 'Jalandhar',
      stateId: pb.id,
      centerLat: 31.3260,
      centerLon: 75.5762,
      minLat: 31.00,
      maxLat: 31.60,
      minLon: 75.30,
      maxLon: 75.90,
    },
  });

  const ludhiana = await prisma.district.create({
    data: {
      code: 'LUDHIANA',
      name: 'Ludhiana',
      stateId: pb.id,
      centerLat: 30.9010,
      centerLon: 75.8573,
      minLat: 30.70,
      maxLat: 31.10,
      minLon: 75.60,
      maxLon: 76.20,
    },
  });

  // Default password for all seeded accounts
  const defaultPassword = 'UrbanEye@2026';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  // 3. Create Hierarchical Accounts
  // National Admin
  await prisma.user.create({
    data: {
      email: 'admin@urbaneye.gov.in',
      passwordHash,
      name: 'Shri Rajesh Verma (MoRTH Director)',
      role: 'NATIONAL_ADMIN',
    },
  });

  // State Admins
  await prisma.user.create({
    data: {
      email: 'admin.mh@urbaneye.gov.in',
      passwordHash,
      name: 'Smt. Neha Kulkarni (MSRDC Chief)',
      role: 'STATE_ADMIN',
      stateId: mh.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin.ka@urbaneye.gov.in',
      passwordHash,
      name: 'Shri Srinivas Rao (KRDCL Director)',
      role: 'STATE_ADMIN',
      stateId: ka.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin.pb@urbaneye.gov.in',
      passwordHash,
      name: 'S. Harpreet Singh (Punjab PWD Chief Engineer)',
      role: 'STATE_ADMIN',
      stateId: pb.id,
    },
  });

  // District Heads
  // Punjab Demo Districts
  await prisma.user.create({
    data: {
      email: 'head.kapurthala@urbaneye.gov.in',
      passwordHash,
      name: 'Er. Gurpreet Singh (Kapurthala Road Commissioner)',
      role: 'DISTRICT_HEAD',
      stateId: pb.id,
      districtId: kapurthala.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'head.jalandhar@urbaneye.gov.in',
      passwordHash,
      name: 'Er. Manjit Kaur (Jalandhar Infrastructure Head)',
      role: 'DISTRICT_HEAD',
      stateId: pb.id,
      districtId: jalandhar.id,
    },
  });

  // Maharashtra & Karnataka Districts
  await prisma.user.create({
    data: {
      email: 'head.mumbai@urbaneye.gov.in',
      passwordHash,
      name: 'Er. Amit Deshmukh (BMC Road Commissioner)',
      role: 'DISTRICT_HEAD',
      stateId: mh.id,
      districtId: mumbaiSuburban.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'head.pune@urbaneye.gov.in',
      passwordHash,
      name: 'Er. Rohan Shinde (PMC Infrastructure Head)',
      role: 'DISTRICT_HEAD',
      stateId: mh.id,
      districtId: pune.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'head.bengaluru@urbaneye.gov.in',
      passwordHash,
      name: 'Dr. Sandeep Gowda (BBMP Chief Engineer)',
      role: 'DISTRICT_HEAD',
      stateId: ka.id,
      districtId: blrUrban.id,
    },
  });

  console.log('Administrative hierarchy seeded successfully!');
  console.log('Login credentials for all users:');
  console.log('★ LIVE DEMO AT LPU: head.kapurthala@urbaneye.gov.in / UrbanEye@2026');
  console.log('National Admin: admin@urbaneye.gov.in / UrbanEye@2026');
  console.log('State Admin (Punjab): admin.pb@urbaneye.gov.in / UrbanEye@2026');
  console.log('District Head (Jalandhar): head.jalandhar@urbaneye.gov.in / UrbanEye@2026');
  console.log('District Head (Mumbai): head.mumbai@urbaneye.gov.in / UrbanEye@2026');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

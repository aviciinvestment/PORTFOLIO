const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
prisma.project.findMany().then(res => {
  console.log(res.map(p => ({ id: p.id, title: p.title, imageLength: p.image?.length, imageStart: p.image?.substring(0, 50) })));
}).finally(() => prisma.$disconnect());

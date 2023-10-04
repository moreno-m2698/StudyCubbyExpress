import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {

    const track = await prisma.single.deleteMany();
    console.log("Successful deletion")
    

}

main()
    .catch(e => {
        console.error(e.message)

    })
    .finally(async () => {
        await prisma.$disconnect()
    })
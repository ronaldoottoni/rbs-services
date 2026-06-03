import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

//Listar Propriedades de uma pessoa
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const pessoaId = searchParams.get("pessoaId")

        if (!pessoaId) {
            return NextResponse.json(
                { error: "Informe o codigo do Proprietário (pessoaId)" },
                { status: 400 }
            )
        }

        const propriedades = await prisma.propriedade.findMany({
            where: {
                pessoaId,
                ativo: true
            },
            include: {
                cliente: true
            },
            orderBy: {
                nome: "asc"
            }
        })

        return NextResponse.json(propriedades);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao buscar propriedades" },
            { status: 500 }
        )
    }
}

//Criar Propriedade
/* export async function POST(request: Request) {
    try {
        const body = await request.json();
        const propriedade = await prisma.propriedade.create({
            data: {

            }
        })

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao cadastrar propriedade" },
            { status: 500 }
        )
    }
} */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

//Listar Projetos de um cliente
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const pessoaId = searchParams.get("pessoaId");

        if (!pessoaId) {
            return NextResponse.json(
                { error: "Informe o código da Pessoa(pessoaId" },
                { status: 400 }
            )
        };

        const projetos = await prisma.projeto.findMany({
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
        });

        return NextResponse.json(projetos)

    } catch (error) {
        console.error(error)

        return NextResponse.json(
            { error: "Erro ao localizar os projetos" },
            { status: 500 }
        )
    }
}

//Criar projeto
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const projeto = await prisma.projeto.create({
            data: {
                clienteId: body.clienteId,
                propriedadeId: body.propriedadeId
            }
        })
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao cadastrar Projeto" },
            { status: 500 }
        )
    }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

//Listar Serviços
export async function GET() {
    try {
        const servicos = await prisma.servicoCatalogo.findMany({
            where: {
                ativo: true,
            },
            orderBy: {
                nome: "asc",
            }
        });

        return NextResponse.json(servicos);
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Erro ao listar Serviços" },
            { status: 500 }
        )
    }
}

//Criar Serviço
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const servico = await prisma.servicoCatalogo.create({
            data: {
                nome: body.nome,
                tipo: body.tipo,
                descricao: body.descricao,
                valorPadrao: body.valorPadrao,
                unidade: body.unidade,
            }
        });

        return NextResponse.json(servico, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao criar Serviço" },
            { status: 500 }
        )
    }
}
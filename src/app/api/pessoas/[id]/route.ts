import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        id: string;
    }>;
}

//Listar Pessoa especifica
export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const pessoa = await prisma.pessoa.findUnique({
            where: {
                id,
            },
        });

        if (!pessoa) {
            return NextResponse.json(
                { error: "Pessoa não encontrada" },
                { status: 404 }
            )
        }
        return NextResponse.json(pessoa);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao buscar pessoa" },
            { status: 500 }
        )
    }
};

//Atualizar uma Pessoa
export async function PUT(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const body = await request.json();

        const pessoa = await prisma.pessoa.update({
            where: {
                id,
            },
            data: {
                tipo: body.tipo,
                cpfCnpj: body.cpfCnpj,
                nome: body.nome,
                telefone: body.telefone,
                email: body.email,
                cidade: body.cidade,
                estado: body.estado,
            }
        })

        return NextResponse.json(pessoa);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao atualizar pessoa" },
            { status: 500 }
        )
    }
}
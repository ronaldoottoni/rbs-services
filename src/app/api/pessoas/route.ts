import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

//Listar Pessoas
export async function GET() {
    try {
        const pessoas = await prisma.pessoa.findMany({
            where:{
                ativo: true,
            },
            orderBy: {
                nome: "asc",
            },
        });
        return NextResponse.json(pessoas);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao buscar pessoas" },
            { status: 500 }
        );
    }
}

//Criar Pessoa
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const pessoa = await prisma.pessoa.create({
            data: {
                tipo: body.tipo,
                cpfCnpj: body.cpfCnpj,
                nome: body.nome,
                telefone: body.telefone,
                email: body.email,
                cidade: body.cidade,
                estado: body.estado,
            },
        });

        return NextResponse.json(pessoa, { status: 201 });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao criar pessoa" },
            { status: 500 }
        );
    }
}
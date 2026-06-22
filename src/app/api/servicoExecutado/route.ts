import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

//Listar Servicos Executados de um projeto
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const projetoId = searchParams.get("projetoId");

        if (!projetoId) {
            return NextResponse.json(
                { error: "Informe o código do Projeto (projetoId)" },
                { status: 400 }
            )
        };

        const servicos = await prisma.servicoExecutado.findMany({
            where: {
                projetoId,
            },
            include: {
                areaProjeto:{
                    include:{
                        projeto:{
                            include: {
                                cliente: true
                            }
                        }
                    }
                }
            },
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao Localizar Serviços Executados no projeto! " },
            { status: 500 }
        )
    }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

//Listar Servicos Executados de um projetoAreaId
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const projetoAreaId = searchParams.get("projetoAreaId");

        if (!projetoAreaId) {
            return NextResponse.json(
                { error: "Informe o código do Projeto (projetoAreaId)" },
                { status: 400 }
            )
        };

        const servicos = await prisma.servicoExecutado.findMany({
            where: {
                projetoAreaId,
            },
            include: {
                projetoArea: {
                    include: {
                        projeto: {
                            include: {
                                cliente: true
                            },
                        },
                        areaPropriedade: true,
                    },
                },
            },
            orderBy: {
                dataExecucao: "desc",
            }
        });

        return NextResponse.json(servicos);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao Localizar Serviços Executados no projeto! " },
            { status: 500 }
        )
    }
}

//Criar um serviço executado em uma área
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const servicoExecutado = await prisma.servicoExecutado.create({
            data: {
                projetoAreaId: body.projetoAreaId,
                dataExecucao: new Date(body.dataExecucao),
                areaExecutadaHa: body.areaExecutadaHa,
                produtoAplicado: body.produtoAplicado,
                doseAplicada: body.doseAplicada,
                valorExecutado: body.valorExecutado,
                observacoes: body.observacoes
            }
        });

        return NextResponse.json(servicoExecutado, { status: 201 })
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao inserir um novo serviço executado" },
            { status: 500 }
        )
    }
}
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Firm from '@/models/Firm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const firm = await Firm.findById(id);

        if (!firm) {
            return NextResponse.json(
                { success: false, error: 'Firm not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: firm });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const firm = await Firm.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!firm) {
            return NextResponse.json(
                { success: false, error: 'Firm not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: firm });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const firm = await Firm.findByIdAndDelete(id);

        if (!firm) {
            return NextResponse.json(
                { success: false, error: 'Firm not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

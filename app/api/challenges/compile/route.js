import { NextResponse } from 'next/server';
import axios from 'axios';

const COMPILER_MAP = {
    'python': 'cpython-3.12.7',
    'python3': 'cpython-3.12.7',
    'java': 'openjdk-jdk-21+35',
    'cpp': 'gcc-13.2.0',
    'c++': 'gcc-13.2.0',
    'c': 'gcc-13.2.0-c',
    'javascript': 'nodejs-20.17.0',
    'js': 'nodejs-20.17.0'
};

export async function POST(request) {
    try {
        const { language, code, stdin } = await request.json();

        if (!code || !code.trim()) {
            return NextResponse.json({ error: 'Code content cannot be empty' }, { status: 400 });
        }

        const compilerId = COMPILER_MAP[language?.toLowerCase()] || COMPILER_MAP['python'];

        const payload = {
            compiler: compilerId,
            code: code,
            stdin: stdin || ''
        };

        const response = await axios.post('https://wandbox.org/api/compile.json', payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000 // 15s execution timeout
        });

        const data = response.data;

        // Map Wandbox output to match Piston API output formats expected by UI compiler console
        const formatted = {
            run: {
                stdout: data.program_output || data.compiler_output || '',
                stderr: data.program_error || data.compiler_error || '',
                code: parseInt(data.status ?? 0)
            }
        };

        return NextResponse.json(formatted);
    } catch (err) {
        console.error('Compilation router error:', err.message, err.stack);
        return NextResponse.json({
            error: `Failed to execute code sandbox: ${err.message}`
        }, { status: 500 });
    }
}

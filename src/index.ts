// console.log("hello express")

import express from 'express';
import type { Express, Request, Response } from 'express';
/* 
説明: 
import typeはTypeScriptの構文で、型情報だけをインポートするために使用されます。
これにより、コンパイル時に型チェックが行われますが、実行時にはこれらの型情報は存在しません。
つまり、import typeでインポートしたものは、実行時にはコードに影響を与えず、開発時の型安全性を提供するだけです。
ここでは、expressパッケージから型定義（Express、Request、Response）をインポートしています。
各型の説明:
 - Express: 
    Expressアプリケーション全体を表す型です。
    const app: Express = express();のように、Expressアプリケーションのインスタンスに型を付けるために使用されます。
 - Request:
    Expressで扱うHTTPリクエストを表す型です。
    Request型を使うことで、リクエストオブジェクトにどのようなプロパティが含まれているかを型安全に扱うことができます。
    例えば、リクエストのパラメータやクエリ、ボディなどを型として明示することができます。
*/

const app: Express = express(); 
/* 
説明:
ここでexpress()関数を呼び出して、Expressアプリケーションを作成し、それをappという定数に代入しています。
このapp変数は、Expressアプリケーションのインスタンスを指します。
また、このインスタンスの型はExpressであると明示されています。
*/
const PORT = 8080;

// ミドルウェアでJSON形式を認識するように設定
// よく忘れるので注意
app.use(express.json());

// ---------- ↓ CORS対応 ↓ ----------
// cors モジュールは、Node.js の Express アプリケーションにおいて、簡単に CORS を設定するために使われるミドルウェアです。
// ミドルウェアとは:
// Node.jsのExpressフレームワークにおいて「ミドルウェア」という言葉は、リクエストとレスポンスの処理の間に実行される関数を指します。
// Expressアプリケーションでは、クライアントからのリクエストがサーバーに到達したときに、リクエストを処理する前後で追加の処理を行うための関数を「ミドルウェア」と呼びます。
// ミドルウェアは、次のような役割を果たします：
//  - リクエストの処理: リクエストがルートに到達する前に、リクエストを解析したり、認証を行ったり、ログを記録したりするために使われます。
//  - レスポンスの処理: ルートでの処理が終わった後に、レスポンスを変換したり、追加のヘッダーを付与したりすることができます。
//  - エラーハンドリング: エラーが発生した場合に、特定の処理を行うミドルウェアもあります。

import cors from "cors";
// cors モジュールをインポートしています。これにより、cors を使って CORS ポリシーを設定できるようになります。

app.use(cors());
// Express アプリケーション全体に対して cors ミドルウェアを適用しています。
// この設定を行うと、すべてのリクエストに対してCORSが有効になります。
// 具体的には、以下のような動作が行われます。
//  - Access-Control-Allow-Origin ヘッダーの設定: レスポンスに Access-Control-Allow-Origin: * が追加
//  - プリフライトリクエストへの対応: ブラウザがCORSのチェックのために送信するOPTIONSリクエストに適切に対応
// もし特定のオリジンからのリクエストのみを許可したい場合や、他のCORSオプションを細かく設定したい場合は、
// cors() 関数にオプションを渡すことでカスタマイズすることもできます。
//  例: app.use(cors({ origin: 'http://example.com' }));
// ---------- ↑ CORS対応 ↑ ----------


// ---------- ↓ Prisma ↓ ----------
// @prisma/clientモジュールからPrismaClientクラスをimport
import { PrismaClient } from "@prisma/client";

// PrismaClientクラスのインスタンス化
const prisma = new PrismaClient();
// ---------- ↑ Prisma ↑ ----------


// エンドポイント: 全てのTODOを取得
app.get("/allTodos", async (req: Request, res: Response) => {    
    // return res.send("Todos");

    const allTodos = await prisma.todo.findMany();
    return res.json(allTodos);
    // JSON形式で返す
});

// エンドポイント: TODOを作成
app.post("/createTodo", async (req: Request, res: Response) => {
    // エラー発生したのでtry/catchを使う
    try {
        //HTTPリクエストのbodyから、追加するレコードの値を取得する
        const { title, isCompleted } = req.body;

        const createTodo = await prisma.todo.create({
            data: {
                title,
                isCompleted,
            },
        });
        return res.json(createTodo);
    } catch (e) {
        return res.status(400).json(e);
    }
});

// エンドポイント: TODOを編集
app.put("/editTodo/:id", async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        // 文字列型を数字型へキャスト
        const { title, isCompleted } = req.body;
        const editTodo = await prisma.todo.update({
            where: { id },
            data: {
                title,
                isCompleted,
            },
        });
        return res.json(editTodo);
    } catch (e) {
        return res.status(400).json(e);
    }
});

// エンドポイント: TODOを削除
app.delete("/deleteTodo/:id", async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const deleteTodo = await prisma.todo.delete({
            where: { id },
        });
        return res.json(deleteTodo);
    } catch (e) {
        return res.status(400).json(e);
    }
});


// Server起動
app.listen(PORT, () => console.log("server is running !"))

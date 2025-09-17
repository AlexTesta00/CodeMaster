import requests

AUTH_URL = "http://codemaster-authentication-service:4004/api/v1/authentication/register/"
LEVEL_URL = "http://codemaster-user-service:4005/api/v1/levels/create/"
TROPHY_URL = "http://codemaster-user-service:4005/api/v1/trophies/create/"
CODEQUESTS_URL = "http://codemaster-codequest-service:3000/api/v1/codequests/"
COMMUNITY_URL = "http://codemaster-community-service:4007/api/v1/comments/"
SOLUTIONS_URL = "http://codemaster-solution-service:4006/api/v1/solutions/"

def get_existing_levels():
    url = 'http://codemaster-user-service:4005/api/v1/levels/'
    result = requests.get(url)
    if result.status_code == 200:
        return result.json()
    else:
        return []

def get_existing_trophies():
    url = 'http://codemaster-user-service:4005/api/v1/trophies/'
    result = requests.get(url)
    if result.status_code == 200:
        return result.json()
    else:
        return []

def create_codequest(codequest):
    try:
        response = requests.post(CODEQUESTS_URL, json=codequest)
        if response.status_code == 201:
            data = response.json()
            codequest = data.get('codequest')
            print(f"[OK] CodeQuest '{codequest['title']}' creato con id: {codequest['id']}")
            return codequest['id']
        else:
            print(f"[ERR] Errore creando '{codequest['title']}': {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"[EXC] Errore durante creazione codequest '{codequest['title']}': {e}")
        return None

if __name__ == "__main__":
    codequest_ids = {}

    codequests = [
        {
            'title': 'Hello World',
            'author': 'rambo',
            'problem': {
                'description': 'Scrivi un programma che stampi "Hello, World!" sulla console.',
                'examples': [
                    {'input': '""', 'output': 'Hello, World!', 'explanation': 'Output statico'}
                ],
                'constraints': []
            },
            'timestamp': None,
            'languages': [
                {'name': 'Java', 'version': '17', 'fileExtension': '.java'},
                {'name': 'Kotlin', 'version': '1.9', 'fileExtension': '.kt'},
                {'name': 'Scala', 'version': '2.13', 'fileExtension': '.scala'}
            ],
            'difficulty': {'name': 'EASY'},
            "functionName": "helloWorld",
            "parameters": [{"name": "a", "typeName": "int"}],
            "returnType": "string",
            "examples": [
                {
                    "inputs": ["2"],
                    "output": "Hello, World!"
                }
            ],
            "lang": ["Java", "Kotlin", "Scala"]
        },
        {
            'title': 'Somma di due numeri',
            'author': 'giovanni',
            'problem': {
                'description': 'Leggi due interi separati da spazio e stampa la loro somma.',
                'examples': [
                    {'input': '3 5', 'output': '8', 'explanation': '3 + 5 = 8'},
                    {'input': '10 20', 'output': '30', 'explanation': '10 + 20 = 30'}
                ],
                'constraints': ['-1000 <= a, b <= 1000']
            },
            'timestamp': None,
            'languages': [
                {'name': 'Java', 'version': '17', 'fileExtension': '.java'},
                {'name': 'Kotlin', 'version': '1.9', 'fileExtension': '.kt'},
                {'name': 'Scala', 'version': '2.13', 'fileExtension': '.scala'}
            ],
            'difficulty': {'name': 'EASY'},
            "functionName": "somma",
            "parameters": [
                {"name": "a", "typeName": "int"},
                {"name": "b", "typeName": "int"}
            ],
            "returnType": "int",
            "examples": [
                {"inputs": ["3", "5"], "output": "8"},
                {"inputs": ["10", "20"], "output": "30"}
            ],
            "lang": ["Java", "Kotlin", "Scala"]
        },
        {
            'title': 'Numero Pari o Dispari',
            'author': 'rambo',
            'problem': {
                'description': 'Dato un numero intero, stampa "Pari" se è pari, altrimenti "Dispari".',
                'examples': [
                    {'input': '4', 'output': 'Pari', 'explanation': '4 è divisibile per 2'},
                    {'input': '7', 'output': 'Dispari', 'explanation': '7 non è divisibile per 2'}
                ],
                'constraints': ['-10^6 <= n <= 10^6']
            },
            'timestamp': None,
            'languages': [
                {'name': 'Java', 'version': '17', 'fileExtension': '.java'},
                {'name': 'Kotlin', 'version': '1.9', 'fileExtension': '.kt'},
                {'name': 'Scala', 'version': '2.13', 'fileExtension': '.scala'}
            ],
            'difficulty': {'name': 'EASY'},
            "functionName": "pariODispari",
            "parameters": [{"name": "n", "typeName": "int"}],
            "returnType": "string",
            "examples": [
                {"inputs": ["4"], "output": "Pari"},
                {"inputs": ["7"], "output": "Dispari"}
            ],
            "lang": ["Java", "Kotlin", "Scala"]
        },
        {
            'title': 'Fattoriale',
            'author': 'aldo',
            'problem': {
                'description': 'Calcola il fattoriale di un numero intero positivo n (0 <= n <= 20).',
                'examples': [
                    {'input': '5', 'output': '120', 'explanation': '5! = 120'},
                    {'input': '0', 'output': '1', 'explanation': '0! = 1 per definizione'}
                ],
                'constraints': ['0 <= n <= 20']
            },
            'timestamp': None,
            'languages': [
                {'name': 'Java', 'version': '17', 'fileExtension': '.java'},
                {'name': 'Kotlin', 'version': '1.9', 'fileExtension': '.kt'}
            ],
            'difficulty': {'name': 'MEDIUM'},
            "functionName": "fattoriale",
            "parameters": [{"name": "n", "typeName": "int"}],
            "returnType": "long",
            "examples": [
                {"inputs": ["5"], "output": "120"},
                {"inputs": ["0"], "output": "1"}
            ],
            "lang": ["Java", "Kotlin"]
        },
        {
            'title': 'Palindromo',
            'author': 'marcob',
            'problem': {
                'description': 'Dato una stringa, determina se è un palindromo (si legge uguale da entrambe le direzioni).',
                'examples': [
                    {'input': 'radar', 'output': 'true', 'explanation': 'radar è palindromo'},
                    {'input': 'hello', 'output': 'false', 'explanation': 'hello non è palindromo'}
                ],
                'constraints': ['La stringa contiene solo lettere minuscole e ha lunghezza <= 1000']
            },
            'timestamp': None,
            'languages': [
                {'name': 'Scala', 'version': '2.13', 'fileExtension': '.scala'},
                {'name': 'Kotlin', 'version': '1.9', 'fileExtension': '.kt'}
            ],
            'difficulty': {'name': 'MEDIUM'},
            "functionName": "isPalindromo",
            "parameters": [{"name": "s", "typeName": "string"}],
            "returnType": "boolean",
            "examples": [
                {"inputs": ["radar"], "output": "true"},
                {"inputs": ["hello"], "output": "false"}
            ],
            "lang": ["Scala", "Kotlin"]
        },
        {
            'title': 'Fibonacci fino a N',
            'author': 'rambo',
            'problem': {
                'description': 'Stampa la sequenza di Fibonacci fino al valore N (incluso), separati da spazi.',
                'examples': [
                    {'input': '10', 'output': '0 1 1 2 3 5 8', 'explanation': 'Fibonacci fino a 10'},
                    {'input': '1', 'output': '0 1 1', 'explanation': 'Fibonacci fino a 1'}
                ],
                'constraints': ['0 <= N <= 10^6']
            },
            'timestamp': None,
            'languages': [
                {'name': 'Java', 'version': '17', 'fileExtension': '.java'},
                {'name': 'Scala', 'version': '2.13', 'fileExtension': '.scala'}
            ],
            'difficulty': {'name': 'HARD'},
            "functionName": "fibonacciFinoAN",
            "parameters": [{"name": "n", "typeName": "int"}],
            "returnType": "string",
            "examples": [
                {"inputs": ["10"], "output": "0 1 1 2 3 5 8"},
                {"inputs": ["1"], "output": "0 1 1"}
            ],
            "lang": ["Java", "Scala"]
        }
    ]

    comments = [
        ('Hello World', 'markzuck', 'Questo esercizio è perfetto per iniziare!'),
        ('Somma di due numeri', 'rambo', 'Attenzione ai numeri negativi, funziona tutto bene.'),
        ('Numero Pari o Dispari', 'fausto99', 'Mi è piaciuto risolverlo con Scala!'),
        ('Fattoriale', 'aldo', 'Il limite a 20 è perfetto per evitare overflow del long.'),
        ('Palindromo', 'marcob', 'Molto interessante usare la funzione reverse per la soluzione.'),
        ('Fibonacci fino a N', 'stevejobs', 'Ho ottimizzato la soluzione con programmazione dinamica.'),
        ('Fibonacci fino a N', 'giacomo', 'Attenzione ai grandi input per non superare i tempi.')
    ]

    users = [
        {'nickname': 'fausto99', 'email': 'fausto@example.com', 'password': 'Password123!', 'role': 'user'},
        {'nickname': 'markzuck', 'email': 'markzuck@example.com', 'password': 'Password123!', 'role': 'user'},
        {'nickname': 'example', 'email': 'example@example.com', 'password': 'Password123!', 'role': 'user'},
        {'nickname': 'stoprosik', 'email': 'stoprosik@example.com', 'password': 'Password123!', 'role': 'admin'},
        {'nickname': 'rambo', 'email': 'rambo@example.com', 'password': 'Password123!', 'role': 'admin'},
        {'nickname': 'aldo', 'email': 'aldo@example.com', 'password': 'Password123!', 'role': 'user'},
        {'nickname': 'giovanni', 'email': 'giovanni@example.com', 'password': 'Password123!', 'role': 'user'},
        {'nickname': 'giacomo', 'email': 'giacomo@example.com', 'password': 'Password123!', 'role': 'user'},
        {'nickname': 'zalone', 'email': 'checcozalone@example.com', 'password': 'Password123!', 'role': 'user'},
        {'nickname': 'marcob', 'email': 'marcob@example.com', 'password': 'Password123!', 'role': 'user'},
        {'nickname': 'stevejobs', 'email': 'stevejobs@example.com', 'password': 'Password123!', 'role': 'user'}
    ]

    levels = [
        {'grade': 1, 'title': 'Novice', 'xpLevel': 1, 'url': 'https://cdn-icons-png.flaticon.com/512/1055/1055646.png'},
        {'grade': 2, 'title': 'Rookie', 'xpLevel': 100, 'url': 'https://cdn-icons-png.flaticon.com/512/2736/2736136.png' },
        {'grade': 3, 'title': 'Amateur', 'xpLevel': 200, 'url': 'https://cdn-icons-png.flaticon.com/512/15873/15873196.png' },
        {'grade': 4, 'title': 'Expert', 'xpLevel': 300, 'url': 'https://cdn-icons-png.flaticon.com/512/11511/11511373.png' },
        {'grade': 5, 'title': 'Champion', 'xpLevel': 400, 'url': 'https://cdn-icons-png.flaticon.com/512/924/924915.png' },
        {'grade': 6, 'title': 'Legend', 'xpLevel': 500, 'url': 'https://cdn-icons-png.flaticon.com/512/1910/1910476.png' },
        {'grade': 7, 'title': 'Ultimate', 'xpLevel': 1000, 'url': 'https://cdn-icons-png.flaticon.com/512/15047/15047490.png' },
        {'grade': 8, 'title': 'Coder', 'xpLevel': 1500, 'url': 'https://cdn-icons-png.flaticon.com/512/10817/10817310.png' },
        {'grade': 9, 'title': 'Master', 'xpLevel': 2000, 'url': 'https://cdn-icons-png.flaticon.com/512/3270/3270465.png' },
        {'grade': 10, 'title': 'CodeMaster', 'xpLevel': 5000, 'url': 'https://cdn-icons-png.flaticon.com/512/432/432492.png' }
    ]

    trophies = [
        {'title': 'Welcome', 'description': 'Welcome to the platform!', 'url': 'https://cdn-icons-png.flaticon.com/512/14697/14697227.png', 'xp': 1},
        {'title': 'First Blood', 'description': 'Complete your first code challenge', 'url': 'https://cdn-icons-png.flaticon.com/512/1477/1477227.png', 'xp': 100},
        {'title': 'Stack Overflow Survivor', 'description': 'You solved a problem after 5 failed attempts', 'url': 'https://cdn-icons-png.flaticon.com/512/2111/2111628.png', 'xp': 50},
        {'title': 'One-Liner Wizard', 'description': 'You solved a challenge with a single line of code', 'url': 'https://cdn-icons-png.flaticon.com/512/7234/7234005.png', 'xp': 100},
        {'title': 'Debugger Pro', 'description': 'You have defeated the bug', 'url': 'https://cdn-icons-png.flaticon.com/512/14807/14807389.png', 'xp': 200},
        {'title': 'Ninja', 'description': 'You used the keyboard exclusively throughout the session', 'url': 'https://cdn-icons-png.flaticon.com/512/1507/1507155.png', 'xp': 100},
        {'title': 'Hacker', 'description': 'Press correct keyboard combo', 'url': 'https://cdn-icons-png.flaticon.com/512/12652/12652488.png', 'xp': 10000},
    ]

    solutions = [
        {
            "title": "Somma di due numeri",
            "user": "giacomo",
            "solved": False,
            "codes": [
                {
                    "language": {
                        "name": "Java",
                        "fileExtension": ".java"
                    },
                    "code": "public static int sum(int a, int b) { return a + b; }"
                }
            ]
        },
        {
            "title": "Fattoriale",
            "user": "giacomo",
            "solved": False,
            "codes": [
                {
                    "language": {
                        "name": "Java",
                        "fileExtension": ".java"
                    },
                    "code": "public static int factorial(int n) { return n <= 1 ? 1 : n * factorial(n - 1); }"
                }
            ]
        },
        {
            "title": "Numero Pari o Dispari",
            "user": "giacomo",
            "solved": False,
            "codes": [
                {
                    "language": {
                        "name": "Java",
                        "fileExtension": ".java"
                    },
                    "code": "public static boolean isEven(int n) { return n % 2 == 0; }"
                }
            ]
        }
    ]

    print("[⏳] Creating users...")
    for user in users:
        try:
            res = requests.post(AUTH_URL, json=user)
            if res.status_code == 201:
                print(f"[✅] User {user['nickname']} created successfully.")
            else:
                print(f"[X] Failed to create user {user['nickname']}: {res.status_code} - {res.text}")
                break
        except requests.exceptions.RequestException as e:
            print(f"Error creating user {user['nickname']}: {e}")
    print("[✅] Users creation completed.")

    print("[⏳] Creating levels...")

    if get_existing_levels():
        print(f"[ℹ️] Skipping levels creation: levels already exist.")
    else:
        for level in levels:
            try:
                res = requests.post(LEVEL_URL, json=level)
                if res.status_code == 200:
                    print(f"[✅] Level {level['title']} created successfully.")
                else:
                    print(f"[X] Failed to create level {level['title']}: {res.status_code} - {res.text}")
                    break
            except requests.exceptions.RequestException as e:
                print(f"Error creating level {level['title']}: {e}")
        print("[✅] Levels creation completed.")

    print("[⏳] Creating trophies...")

    if get_existing_trophies():
        print(f"[ℹ️] Skipping trophy creation: trophies already exist.")
    else:
        for trophy in trophies:
            try:
                res = requests.post(TROPHY_URL, json=trophy)
                if res.status_code == 200:
                    print(f"[✅] Trophy {trophy['title']} created successfully.")
                else:
                    print(f"[X] Failed to create trophy {trophy['title']}: {res.status_code} - {res.text}")
                    break
            except requests.exceptions.RequestException as e:
                print(f"Error creating trophy {trophy['title']}: {e}")
        print("[✅] Trophies creation completed.")

    print("[⏳] Creating codequests...")
    for cq in codequests:
        cq_id = create_codequest(cq)
        if cq_id:
            codequest_ids[cq['title']] = cq_id

    print("[✅] Codequests creation completed.")

    print("[⏳] Creating comments...")
    for title, author, content in comments:
        quest_id = codequest_ids.get(title)
        if not quest_id:
            print(f"[WARN] Nessun id trovato per codequest '{title}', salto commento.")
            continue
        payload = {
            'questId': quest_id,
            'author': author,
            'content': content,
            'timestamp': None
        }
        response = requests.post(COMMUNITY_URL, json=payload)
        if response.status_code == 201:
            print(f"✅ Add comment: {title}, {author}, {content}")
        else:
            print(f"❌ {response.status_code} - {response.text}")

    for sol in solutions:
        quest_id = codequest_ids.get(sol['title'])
        if not quest_id:
            print(f"⚠️ Nessun ID trovato per '{sol['title']}'")
            continue

        payload = {
            "user": sol["user"],
            "questId": quest_id,
            "solved": sol["solved"],
            "codes": sol["codes"]
        }

        response = requests.post(SOLUTIONS_URL, json=payload)
        if response.status_code == 200:
            print(f"✅ Create solution with '{sol['title']}'")
        else:
            print(f"❌ Error with '{sol['title']}': {response.status_code} - {response.text}")

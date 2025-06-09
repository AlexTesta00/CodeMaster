import requests

AUTH_URL = "http://codemaster-authentication-service:4004/api/v1/authentication/register"
LEVEL_URL = "http://codemaster-user-service:4005/api/v1/levels/create"
TROPHY_URL = "http://codemaster-user-service:4005/api/v1/trophies/create"

if __name__ == "__main__":

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
        {'grade': 1, 'title': 'Novice', 'xpLevel': 1},
        {'grade': 2, 'title': 'Rookie', 'xpLevel': 100},
        {'grade': 3, 'title': 'Amateur', 'xpLevel': 200},
        {'grade': 4, 'title': 'Expert', 'xpLevel': 300},
        {'grade': 5, 'title': 'Champion', 'xpLevel': 400},
        {'grade': 6, 'title': 'Legend', 'xpLevel': 500},
        {'grade': 7, 'title': 'Ultimate', 'xpLevel': 1000},
        {'grade': 8, 'title': 'Coder', 'xpLevel': 1500},
        {'grade': 9, 'title': 'Master', 'xpLevel': 2000},
        {'grade': 10, 'title': 'CodeMaster', 'xpLevel': 5000}
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
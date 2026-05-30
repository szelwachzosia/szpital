from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import sqlite3
import threading
from sqlite3 import IntegrityError, OperationalError

app = Flask(__name__)
CORS(app, 
     resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type"]}},
     supports_credentials=False)
DB_PATH = 'db/sprawdzenia.db'
db_lock = threading.Lock()

def get_db_connection():
    con = sqlite3.connect(DB_PATH, timeout=10, check_same_thread=False)
    con.row_factory = sqlite3.Row
    con.execute('PRAGMA journal_mode=WAL;')
    return con

def query_db(query, args=(), one=False):
    with db_lock:
        con = get_db_connection()
        try:
            cur = con.execute(query, args)
            rv = cur.fetchall()
            con.commit()
        finally:
            con.close()
    return (rv[0] if rv else None) if one else rv

def execute_db(query, args=()):
    with db_lock:
        con = get_db_connection()
        try:
            cur = con.execute(query, args)
            con.commit()
        except sqlite3.IntegrityError as e:
            con.rollback()
            raise e
        finally:
            con.close()

def safe_execute_db(query, args=()):
    try:
        execute_db(query, args)
        return None
    except IntegrityError as e:
        return make_response(jsonify({'status': 'error', 'message': str(e)}), 400)
    except OperationalError as e:
        if 'database is locked' in str(e):
            return make_response(jsonify({'status': 'error', 'message': 'Database is locked, try again.'}), 503)
        return make_response(jsonify({'status': 'error', 'message': str(e)}), 500)

@app.route('/api/pracownicy', methods=['GET'])
def get_pracownicy():
    rows = query_db('SELECT * FROM Pracownicy')
    return jsonify([dict(row) for row in rows])

@app.route('/api/pracownicy', methods=['POST'])
def add_pracownik():
    data = request.json
    err = safe_execute_db(
        '''INSERT INTO Pracownicy (imie, nazwisko, stanowisko, adres, numer_telefonu, rodzaj_pensji, pensja, specjalizacja)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
        (data['imie'], data['nazwisko'], data['stanowisko'], data['adres'], data['numer_telefonu'], data['rodzaj_pensji'], data['pensja'], data.get('specjalizacja'))
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/pracownicy/<int:id>', methods=['PUT'])
def update_pracownik(id):
    data = request.json
    err = safe_execute_db(
        '''UPDATE Pracownicy SET imie=?, nazwisko=?, stanowisko=?, adres=?, numer_telefonu=?, rodzaj_pensji=?, pensja=?, specjalizacja=?
           WHERE pracownik_id=?''',
        (data['imie'], data['nazwisko'], data['stanowisko'], data['adres'], data['numer_telefonu'], data['rodzaj_pensji'], data['pensja'], data.get('specjalizacja'), id)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/pracownicy/<int:id>', methods=['DELETE'])
def delete_pracownik(id):
    err = safe_execute_db('DELETE FROM Pracownicy WHERE pracownik_id=?', (id,))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/oddzial', methods=['GET'])
def get_oddzial():
    rows = query_db('''
        SELECT o.*, p1.imie as pielegniarka_imie, p1.nazwisko as pielegniarka_nazwisko, p2.imie as ordynator_imie, p2.nazwisko as ordynator_nazwisko
        FROM Oddzial o
        JOIN Pracownicy p1 ON o.pielegniarka_id = p1.pracownik_id
        JOIN Pracownicy p2 ON o.ordynator_id = p2.pracownik_id
    ''')
    return jsonify([dict(row) for row in rows])

@app.route('/api/oddzial', methods=['POST'])
def add_oddzial():
    data = request.json
    err = safe_execute_db(
        '''INSERT INTO Oddzial (nazwa, pielegniarka_id, ordynator_id)
           VALUES (?, ?, ?)''',
        (data['nazwa'], data['pielegniarka_id'], data['ordynator_id'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/oddzial/<int:id>', methods=['PUT'])
def update_oddzial(id):
    data = request.json
    err = safe_execute_db(
        '''UPDATE Oddzial SET nazwa=?, pielegniarka_id=?, ordynator_id=?
           WHERE oddzial_id=?''',
        (data['nazwa'], data['pielegniarka_id'], data['ordynator_id'], id)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/oddzial/<int:id>', methods=['DELETE'])
def delete_oddzial(id):
    err = safe_execute_db('DELETE FROM Oddzial WHERE oddzial_id=?', (id,))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/pracownicy_oddzial', methods=['GET'])
def get_pracownicy_oddzial():
    pracownik_id = request.args.get('pracownik_id')
    oddzial_id = request.args.get('oddzial_id')
    tydzien_start = request.args.get('tydzien_start')
    query = '''
        SELECT po.pracownik_id, po.oddzial_id, po.tydzien_start, po.ilosc_godzin,
               p.imie, p.nazwisko, o.nazwa as oddzial_nazwa
        FROM Pracownicy_Oddzial po
        JOIN Pracownicy p ON po.pracownik_id = p.pracownik_id
        JOIN Oddzial o ON po.oddzial_id = o.oddzial_id
        WHERE 1=1
    '''
    params = []
    if pracownik_id:
        query += ' AND po.pracownik_id = ?'
        params.append(pracownik_id)
    if oddzial_id:
        query += ' AND po.oddzial_id = ?'
        params.append(oddzial_id)
    if tydzien_start:
        query += ' AND po.tydzien_start = ?'
        params.append(tydzien_start)
    rows = query_db(query, params)
    return jsonify([dict(row) for row in rows])

@app.route('/api/pracownicy_oddzial', methods=['POST'])
def add_pracownicy_oddzial():
    data = request.json
    err = safe_execute_db(
        '''INSERT INTO Pracownicy_Oddzial (pracownik_id, oddzial_id, tydzien_start, ilosc_godzin)
           VALUES (?, ?, ?, ?)''',
        (data['pracownik_id'], data['oddzial_id'], data['tydzien_start'], data['ilosc_godzin'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/pracownicy_oddzial', methods=['PUT'])
def update_pracownicy_oddzial():
    data = request.json
    err = safe_execute_db(
        '''UPDATE Pracownicy_Oddzial SET ilosc_godzin=?
           WHERE pracownik_id=? AND oddzial_id=? AND tydzien_start=?''',
        (data['ilosc_godzin'], data['pracownik_id'], data['oddzial_id'], data['tydzien_start'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/pracownicy_oddzial', methods=['DELETE'])
def delete_pracownicy_oddzial():
    data = request.json
    err = safe_execute_db(
        'DELETE FROM Pracownicy_Oddzial WHERE pracownik_id=? AND oddzial_id=? AND tydzien_start=?',
        (data['pracownik_id'], data['oddzial_id'], data['tydzien_start'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/pracownicy_oddzial/<int:pracownik_id>/<int:oddzial_id>/<tydzien_start>', methods=['PUT'])
def update_pracownicy_oddzial_by_key(pracownik_id, oddzial_id, tydzien_start):
    data = request.json
    ilosc_godzin = data.get('ilosc_godzin')
    if ilosc_godzin is None:
        return make_response(jsonify({'status': 'error', 'message': 'Brak pola ilosc_godzin'}), 400)
    err = safe_execute_db(
        '''UPDATE Pracownicy_Oddzial SET ilosc_godzin=? WHERE pracownik_id=? AND oddzial_id=? AND tydzien_start=?''',
        (ilosc_godzin, pracownik_id, oddzial_id, tydzien_start)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/pracownicy_oddzial/<int:pracownik_id>/<int:oddzial_id>/<tydzien_start>', methods=['DELETE'])
def delete_pracownicy_oddzial_by_key(pracownik_id, oddzial_id, tydzien_start):
    err = safe_execute_db(
        'DELETE FROM Pracownicy_Oddzial WHERE pracownik_id=? AND oddzial_id=? AND tydzien_start=?',
        (pracownik_id, oddzial_id, tydzien_start)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/pacjent', methods=['GET'])
def get_pacjent():
    rows = query_db('''
        SELECT p.*, l.imie as lekarz_imie, l.nazwisko as lekarz_nazwisko
        FROM Pacjent p
        JOIN Pracownicy l ON p.id_lekarza_kierujacego = l.pracownik_id
    ''')
    return jsonify([dict(row) for row in rows])

@app.route('/api/pacjent', methods=['POST'])
def add_pacjent():
    data = request.json
    err = safe_execute_db(
        '''INSERT INTO Pacjent (imie, nazwisko, adres, data_urodzenia, najblizsi, przyjecie_rodzaj, id_lekarza_kierujacego, choroby)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
        (data['imie'], data['nazwisko'], data['adres'], data['data_urodzenia'], data['najblizsi'], data['przyjecie_rodzaj'], data['id_lekarza_kierujacego'], data['choroby'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/pacjent/<int:id>', methods=['PUT'])
def update_pacjent(id):
    data = request.json
    err = safe_execute_db(
        '''UPDATE Pacjent SET imie=?, nazwisko=?, adres=?, data_urodzenia=?, najblizsi=?, przyjecie_rodzaj=?, id_lekarza_kierujacego=?, choroby=?
           WHERE pacjent_id=?''',
        (data['imie'], data['nazwisko'], data['adres'], data['data_urodzenia'], data['najblizsi'], data['przyjecie_rodzaj'], data['id_lekarza_kierujacego'], data['choroby'], id)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/pacjent/<int:id>', methods=['DELETE'])
def delete_pacjent(id):
    err = safe_execute_db('DELETE FROM Pacjent WHERE pacjent_id=?', (id,))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/lozko', methods=['GET'])
def get_lozko():
    rows = query_db('''
        SELECT l.*, o.nazwa as oddzial_nazwa
        FROM Lozko l
        JOIN Oddzial o ON l.oddzial_id = o.oddzial_id
    ''')
    return jsonify([dict(row) for row in rows])

@app.route('/api/lozko', methods=['POST'])
def add_lozko():
    data = request.json
    err = safe_execute_db(
        '''INSERT INTO Lozko (pokoj_nr, oddzial_id)
           VALUES (?, ?)''',
        (data['pokoj_nr'], data['oddzial_id'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/lozko/<int:id>', methods=['PUT'])
def update_lozko(id):
    data = request.json
    err = safe_execute_db(
        '''UPDATE Lozko SET pokoj_nr=?, oddzial_id=?
           WHERE lozko_id=?''',
        (data['pokoj_nr'], data['oddzial_id'], id)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/lozko/<int:id>', methods=['DELETE'])
def delete_lozko(id):
    err = safe_execute_db('DELETE FROM Lozko WHERE lozko_id=?', (id,))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/wizyty', methods=['GET'])
def get_wizyty():
    rows = query_db('SELECT * FROM Wizyty')
    return jsonify([dict(row) for row in rows])

@app.route('/api/wizyty', methods=['POST'])
def add_wizyta():
    data = request.json
    err = safe_execute_db(
        'INSERT INTO Wizyty (pacjent_id, pracownik_id, lozko_id, data_przyjecia, data_wypisu, data_wizyty, rodzaj_wizyty, komentarz) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (
            data['pacjent_id'],
            data['pracownik_id'],
            data.get('lozko_id'),
            data['data_przyjecia'],
            data.get('data_wypisu'),
            data['data_wizyty'],
            data['rodzaj_wizyty'],
            data.get('komentarz', '')
        )
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/wizyty/<int:wizyta_id>', methods=['PUT'])
def update_wizyta(wizyta_id):
    data = request.json
    err = safe_execute_db(
        'UPDATE Wizyty SET pacjent_id=?, pracownik_id=?, lozko_id=?, data_przyjecia=?, data_wypisu=?, data_wizyty=?, rodzaj_wizyty=?, komentarz=? WHERE wizyta_id=?',
        (
            data['pacjent_id'],
            data['pracownik_id'],
            data.get('lozko_id'),
            data['data_przyjecia'],
            data.get('data_wypisu'),
            data['data_wizyty'],
            data['rodzaj_wizyty'],
            data.get('komentarz', ''),
            wizyta_id
        )
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/wizyty/<int:wizyta_id>', methods=['DELETE'])
def delete_wizyta(wizyta_id):
    err = safe_execute_db('DELETE FROM Wizyty WHERE wizyta_id=?', (wizyta_id,))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/lekarze', methods=['GET'])
def get_lekarze():
    rows = query_db('SELECT * FROM Lekarze')
    return jsonify([dict(row) for row in rows])

@app.route('/api/lekarze', methods=['POST'])
def add_lekarz():
    data = request.json
    err = safe_execute_db(
        '''INSERT INTO Lekarze (pracownik_id, specjalizacja, ordynator_id, oddzial_id)
           VALUES (?, ?, ?, ?)''',
        (data['pracownik_id'], data['specjalizacja'], data['ordynator_id'], data['oddzial_id'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/lekarze/<int:id>', methods=['PUT'])
def update_lekarz(id):
    data = request.json
    err = safe_execute_db(
        '''UPDATE Lekarze SET pracownik_id=?, specjalizacja=?, ordynator_id=?, oddzial_id=?
           WHERE lekarz_id=?''',
        (data['pracownik_id'], data['specjalizacja'], data['ordynator_id'], data['oddzial_id'], id)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/lekarze/<int:id>', methods=['DELETE'])
def delete_lekarz(id):
    err = safe_execute_db('DELETE FROM Lekarze WHERE lekarz_id=?', (id,))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/test_pacjent', methods=['GET'])
def get_test_pacjent():
    rows = query_db('SELECT * FROM Test_pacjent')
    return jsonify([dict(row) for row in rows])

@app.route('/api/test_pacjent', methods=['POST'])
def add_test_pacjent():
    data = request.json
    err = safe_execute_db(
        '''INSERT INTO Test_pacjent (test_id, pacjent_id, pracownik_id, data, wynik)
           VALUES (?, ?, ?, ?, ?)''',
        (data['test_id'], data['pacjent_id'], data['pracownik_id'], data['data'], data['wynik'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/test_pacjent/<int:id>', methods=['PUT'])
def update_test_pacjent(id):
    data = request.json
    err = safe_execute_db(
        '''UPDATE Test_pacjent SET test_id=?, pacjent_id=?, pracownik_id=?, data=?, wynik=?
           WHERE test_pacjent_id=?''',
        (data['test_id'], data['pacjent_id'], data['pracownik_id'], data['data'], data['wynik'], id)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/test_pacjent/<int:id>', methods=['DELETE'])
def delete_test_pacjent(id):
    err = safe_execute_db('DELETE FROM Test_pacjent WHERE test_pacjent_id=?', (id,))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/wszystkie_testy', methods=['GET'])
def get_wszystkie_testy():
    rows = query_db('SELECT * FROM Test_sprzet_wizyta')
    return jsonify([dict(row) for row in rows])

@app.route('/api/wszystkie_testy', methods=['POST'])
def add_wszystkie_testy():
    data = request.json
    err = safe_execute_db(
        '''INSERT INTO Wszystkie_testy (nazwa)
           VALUES (?)''',
        (data['nazwa'],)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/wszystkie_testy/<int:id>', methods=['PUT'])
def update_wszystkie_testy(id):
    data = request.json
    err = safe_execute_db(
        '''UPDATE Wszystkie_testy SET nazwa=?
           WHERE test_id=?''',
        (data['nazwa'], id)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/wszystkie_testy/<int:id>', methods=['DELETE'])
def delete_wszystkie_testy(id):
    err = safe_execute_db('DELETE FROM Wszystkie_testy WHERE test_id=?', (id,))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/sprzety', methods=['GET'])
def get_sprzety():
    rows = query_db('SELECT * FROM Sprzety')
    return jsonify([dict(row) for row in rows])

@app.route('/api/sprzety', methods=['POST'])
def add_sprzet():
    data = request.json
    err = safe_execute_db(
        '''INSERT INTO Sprzety (nazwa, oddzial_id)
           VALUES (?, ?)''',
        (data['nazwa'], data['oddzial_id'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/sprzety/<int:id>', methods=['PUT'])
def update_sprzet(id):
    data = request.json
    err = safe_execute_db(
        '''UPDATE Sprzety SET nazwa=?, oddzial_id=?
           WHERE sprzet_id=?''',
        (data['nazwa'], data['oddzial_id'], id)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/sprzety/<int:id>', methods=['DELETE'])
def delete_sprzet(id):
    err = safe_execute_db('DELETE FROM Sprzety WHERE sprzet_id=?', (id,))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/leki_pacjent', methods=['GET'])
def get_leki_pacjent():
    rows = query_db('SELECT * FROM Leki_pacjent')
    return jsonify([dict(row) for row in rows])

@app.route('/api/leki_pacjent', methods=['POST'])
def add_leki_pacjent():
    data = request.json
    err = safe_execute_db(
        '''INSERT INTO Leki_pacjent (pacjent_id, lek_id, data_podania, dawka, komentarz)
           VALUES (?, ?, ?, ?, ?)''',
        (data['pacjent_id'], data['lek_id'], data['data_podania'], data['dawka'], data['komentarz'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/leki_pacjent/<int:id>', methods=['PUT'])
def update_leki_pacjent(id):
    data = request.json
    err = safe_execute_db(
        '''UPDATE Leki_pacjent SET pacjent_id=?, lek_id=?, data_podania=?, dawka=?, komentarz=?
           WHERE lek_pacjent_id=?''',
        (data['pacjent_id'], data['lek_id'], data['data_podania'], data['dawka'], data['komentarz'], id)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/leki_pacjent/<int:id>', methods=['DELETE'])
def delete_leki_pacjent(id):
    err = safe_execute_db('DELETE FROM Leki_pacjent WHERE lek_pacjent_id=?', (id,))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/leki', methods=['GET'])
def get_leki():
    rows = query_db('SELECT * FROM Leki')
    return jsonify([dict(row) for row in rows])

@app.route('/api/leki', methods=['POST'])
def add_lek():
    data = request.json
    err = safe_execute_db(
        '''INSERT INTO Leki (nazwa, typ, producent, data_przeterminowania)
           VALUES (?, ?, ?, ?)''',
        (data['nazwa'], data['typ'], data['producent'], data['data_przeterminowania'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/leki/<int:id>', methods=['PUT'])
def update_lek(id):
    data = request.json
    err = safe_execute_db(
        '''UPDATE Leki SET nazwa=?, typ=?, producent=?, data_przeterminowania=?
           WHERE lek_id=?''',
        (data['nazwa'], data['typ'], data['producent'], data['data_przeterminowania'], id)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/leki/<int:id>', methods=['DELETE'])
def delete_lek(id):
    err = safe_execute_db('DELETE FROM Leki WHERE lek_id=?', (id,))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/lek_wizyta', methods=['GET'])
def get_lek_wizyta():
    rows = query_db('SELECT * FROM Lek_wizyta')
    return jsonify([dict(row) for row in rows])

@app.route('/api/lek_wizyta', methods=['POST'])
def add_lek_wizyta():
    data = request.json
    err = safe_execute_db(
        '''INSERT INTO Lek_wizyta (lek_id, wizyta_id, dawka, komentarz)
           VALUES (?, ?, ?, ?)''',
        (data['lek_id'], data['wizyta_id'], data['dawka'], data['komentarz'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/lek_wizyta', methods=['PUT'])
def update_lek_wizyta():
    data = request.json
    err = safe_execute_db(
        '''UPDATE Lek_wizyta SET dawka=?, komentarz=?
           WHERE lek_id=? AND wizyta_id=?''',
        (data['dawka'], data['komentarz'], data['lek_id'], data['wizyta_id'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/lek_wizyta', methods=['DELETE'])
def delete_lek_wizyta():
    data = request.json
    err = safe_execute_db(
        'DELETE FROM Lek_wizyta WHERE lek_id=? AND wizyta_id=?',
        (data['lek_id'], data['wizyta_id'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/zabieg_wizyta', methods=['GET'])
def get_zabieg_wizyta():
    rows = query_db('SELECT * FROM Zabieg_wizyta')
    return jsonify([dict(row) for row in rows])

@app.route('/api/zabieg_wizyta', methods=['POST'])
def add_zabieg_wizyta():
    data = request.json
    required = ['zabieg_id', 'wizyta_id', 'typ', 'data', 'godzina', 'opis', 'wynik']
    for field in required:
        if field not in data or data[field] in [None, '']:
            return jsonify({'error': f'Missing or empty field: {field}'}), 400
    try:
        zabieg_id = int(data['zabieg_id'])
        wizyta_id = int(data['wizyta_id'])
        godzina = int(data['godzina'])
    except Exception:
        return jsonify({'error': 'zabieg_id, wizyta_id i godzina muszą być liczbami całkowitymi'}), 400
    err = safe_execute_db(
        '''INSERT INTO Zabieg_wizyta (zabieg_id, wizyta_id, typ, data, godzina, opis, wynik)
           VALUES (?, ?, ?, ?, ?, ?, ?)''',
        (zabieg_id, wizyta_id, data['typ'], data['data'], godzina, data['opis'], data['wynik'])
    )
    if err:
        # Obsługa błędu UNIQUE constraint
        msg = str(err.get_json()['message']) if hasattr(err, 'get_json') else str(err)
        if 'UNIQUE constraint failed' in msg:
            return jsonify({'error': 'Taki zabieg-wizyta już istnieje (unikalna para zabieg_id i wizyta_id).'}), 400
        return jsonify({'error': msg}), 400
    return jsonify({'status': 'ok'})

@app.route('/api/zabieg_wizyta/<int:zabieg_id>', methods=['PUT'])
def update_zabieg_wizyta(zabieg_id):
    data = request.json
    required = ['wizyta_id', 'typ', 'data', 'godzina', 'opis', 'wynik']
    for field in required:
        if field not in data or data[field] in [None, '']:
            return jsonify({'error': f'Missing or empty field: {field}'}), 400
    try:
        wizyta_id = int(data['wizyta_id'])
        godzina = int(data['godzina'])
    except Exception:
        return jsonify({'error': 'wizyta_id i godzina muszą być liczbami całkowitymi'}), 400
    err = safe_execute_db(
        '''UPDATE Zabieg_wizyta SET wizyta_id=?, typ=?, data=?, godzina=?, opis=?, wynik=? WHERE zabieg_id=?''',
        (wizyta_id, data['typ'], data['data'], godzina, data['opis'], data['wynik'], zabieg_id)
    )
    if err:
        msg = str(err.get_json()['message']) if hasattr(err, 'get_json') else str(err)
        return jsonify({'error': msg}), 400
    return jsonify({'status': 'ok'})

@app.route('/api/zabieg_wizyta/<int:zabieg_id>', methods=['DELETE'])
def delete_zabieg_wizyta(zabieg_id):
    err = safe_execute_db('DELETE FROM Zabieg_wizyta WHERE zabieg_id=?', (zabieg_id,))
    if err:
        msg = str(err.get_json()['message']) if hasattr(err, 'get_json') else str(err)
        return jsonify({'error': msg}), 400
    return jsonify({'status': 'ok'})

@app.route('/api/zabieg_lekarz', methods=['GET'])
def get_zabieg_lekarz():
    rows = query_db('SELECT * FROM Zabieg_lekarz')
    return jsonify([dict(row) for row in rows])

@app.route('/api/zabieg_lekarz', methods=['POST'])
def add_zabieg_lekarz():
    data = request.json
    err = safe_execute_db(
        '''INSERT INTO Zabieg_lekarz (zabieg_id, pracownik_id, rola)
           VALUES (?, ?, ?)''',
        (data['zabieg_id'], data['pracownik_id'], data.get('rola'))
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/zabieg_lekarz', methods=['PUT'])
def update_zabieg_lekarz():
    data = request.json
    err = safe_execute_db(
        '''UPDATE Zabieg_lekarz SET rola=?
           WHERE zabieg_id=? AND pracownik_id=?''',
        (data.get('rola'), data['zabieg_id'], data['pracownik_id'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/zabieg_lekarz', methods=['DELETE'])
def delete_zabieg_lekarz():
    data = request.json
    err = safe_execute_db(
        'DELETE FROM Zabieg_lekarz WHERE zabieg_id=? AND pracownik_id=?',
        (data['zabieg_id'], data['pracownik_id'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/sprzet_szpitala', methods=['GET'])
def get_sprzet_szpitala():
    rows = query_db('SELECT * FROM Sprzet_szpitala')
    return jsonify([dict(row) for row in rows])

@app.route('/api/sprzet_szpitala', methods=['POST'])
def add_sprzet_szpitala():
    data = request.json
    err = safe_execute_db(
        '''INSERT INTO Sprzet_szpitala (nazwa, producent, typ)
           VALUES (?, ?, ?)''',
        (data['nazwa'], data['producent'], data['typ'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/sprzet_szpitala/<int:id>', methods=['PUT'])
def update_sprzet_szpitala(id):
    data = request.json
    err = safe_execute_db(
        '''UPDATE Sprzet_szpitala SET nazwa=?, producent=?, typ=?
           WHERE sprzet_id=?''',
        (data['nazwa'], data['producent'], data['typ'], id)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/sprzet_szpitala/<int:id>', methods=['DELETE'])
def delete_sprzet_szpitala(id):
    err = safe_execute_db('DELETE FROM Sprzet_szpitala WHERE sprzet_id=?', (id,))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/test_sprzet_wizyta', methods=['GET'])
def get_test_sprzet_wizyta():
    rows = query_db('''
        SELECT tsw.sprzet_id, tsw.wizyta_id, tsw.data, tsw.godzina, tsw.wynik, tsw.test_nazwa, 
               s.nazwa as sprzet_nazwa, w.pacjent_id, w.data_wizyty
        FROM Test_sprzet_wizyta tsw
        JOIN Sprzet_szpitala s ON tsw.sprzet_id = s.sprzet_id
        JOIN Wizyty w ON tsw.wizyta_id = w.wizyta_id
    ''')
    return jsonify([dict(row) for row in rows])

@app.route('/api/test_sprzet_wizyta', methods=['POST'])
def add_test_sprzet_wizyta():
    data = request.json
    if 'test_nazwa' not in data or not data['test_nazwa']:
        return jsonify({'status': 'error', 'message': 'Pole test_nazwa jest wymagane.'}), 400
    err = safe_execute_db(
        '''INSERT INTO Test_sprzet_wizyta (sprzet_id, wizyta_id, data, godzina, wynik, test_nazwa)
           VALUES (?, ?, ?, ?, ?, ?)''',
        (data['sprzet_id'], data['wizyta_id'], data['data'], data['godzina'], data['wynik'], data['test_nazwa'])
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/test_sprzet_wizyta/<int:sprzet_id>/<int:wizyta_id>', methods=['PUT'])
def update_test_sprzet_wizyta(sprzet_id, wizyta_id):
    data = request.json
    if 'test_nazwa' not in data or not data['test_nazwa']:
        return jsonify({'status': 'error', 'message': 'Pole test_nazwa jest wymagane.'}), 400
    err = safe_execute_db(
        '''UPDATE Test_sprzet_wizyta SET data=?, godzina=?, wynik=?, test_nazwa=?
           WHERE sprzet_id=? AND wizyta_id=?''',
        (data['data'], data['godzina'], data['wynik'], data['test_nazwa'], sprzet_id, wizyta_id)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/test_sprzet_wizyta/<int:sprzet_id>/<int:wizyta_id>', methods=['DELETE'])
def delete_test_sprzet_wizyta(sprzet_id, wizyta_id):
    err = safe_execute_db(
        'DELETE FROM Test_sprzet_wizyta WHERE sprzet_id=? AND wizyta_id=?',
        (sprzet_id, wizyta_id)
    )
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/przedmioty', methods=['GET'])
def get_przedmioty():
    rows = query_db('SELECT * FROM Przedmioty')
    return jsonify([dict(row) for row in rows])

@app.route('/api/przedmioty', methods=['POST'])
def add_przedmiot():
    data = request.json
    err = safe_execute_db('INSERT INTO Przedmioty (nazwa, koszt_jednostkowy, ulotka) VALUES (?, ?, ?)',
               (data['nazwa'], data['koszt_jednostkowy'], data.get('ulotka', '')))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/przedmioty/<int:przedmiot_id>', methods=['PUT'])
def update_przedmiot(przedmiot_id):
    data = request.json
    err = safe_execute_db('UPDATE Przedmioty SET nazwa=?, koszt_jednostkowy=?, ulotka=? WHERE przedmiot_id=?',
               (data['nazwa'], data['koszt_jednostkowy'], data.get('ulotka', ''), przedmiot_id))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/przedmioty/<int:przedmiot_id>', methods=['DELETE'])
def delete_przedmiot(przedmiot_id):
    err = safe_execute_db('DELETE FROM Przedmioty WHERE przedmiot_id=?', (przedmiot_id,))
    if err: return err
    return jsonify({'status': 'ok'})

@app.route('/api/przedmioty_wizyta', methods=['GET'])
def get_przedmioty_wizyta():
    rows = query_db('SELECT * FROM Przedmioty_wizyta')
    return jsonify([dict(row) for row in rows])

@app.route('/api/przedmioty_wizyta', methods=['POST'])
def add_przedmioty_wizyta():
    data = request.json
    required = ['przedmiot_id', 'wizyta_id', 'data_uzycia', 'godz_uzycia', 'ilosc_zuzyta']
    for field in required:
        if field not in data or data[field] in [None, '']:
            return jsonify({'error': f'Missing or empty field: {field}'}), 400
    try:
        przedmiot_id = int(data['przedmiot_id'])
        wizyta_id = int(data['wizyta_id'])
        godz_uzycia = int(data['godz_uzycia'])
        ilosc_zuzyta = int(data['ilosc_zuzyta'])
    except Exception:
        return jsonify({'error': 'przedmiot_id, wizyta_id, godz_uzycia i ilosc_zuzyta muszą być liczbami całkowitymi'}), 400
    err = safe_execute_db(
        '''INSERT INTO Przedmioty_wizyta (przedmiot_id, wizyta_id, data_uzycia, godz_uzycia, ilosc_zuzyta)
           VALUES (?, ?, ?, ?, ?)''',
        (przedmiot_id, wizyta_id, data['data_uzycia'], godz_uzycia, ilosc_zuzyta)
    )
    if err:
        msg = str(err.get_json()['message']) if hasattr(err, 'get_json') else str(err)
        if 'UNIQUE constraint failed' in msg:
            return jsonify({'error': 'Taki przedmiot-wizyta już istnieje (unikalna para przedmiot_id i wizyta_id).'}), 400
        return jsonify({'error': msg}), 400
    return jsonify({'status': 'ok'})

@app.route('/api/przedmioty_wizyta/<int:przedmiot_id>/<int:wizyta_id>', methods=['PUT'])
def update_przedmioty_wizyta(przedmiot_id, wizyta_id):
    data = request.json
    required = ['data_uzycia', 'godz_uzycia', 'ilosc_zuzyta']
    for field in required:
        if field not in data or data[field] in [None, '']:
            return jsonify({'error': f'Missing or empty field: {field}'}), 400
    try:
        godz_uzycia = int(data['godz_uzycia'])
        ilosc_zuzyta = int(data['ilosc_zuzyta'])
    except Exception:
        return jsonify({'error': 'godz_uzycia i ilosc_zuzyta muszą być liczbami całkowitymi'}), 400
    err = safe_execute_db(
        '''UPDATE Przedmioty_wizyta SET data_uzycia=?, godz_uzycia=?, ilosc_zuzyta=?
           WHERE przedmiot_id=? AND wizyta_id=?''',
        (data['data_uzycia'], godz_uzycia, ilosc_zuzyta, przedmiot_id, wizyta_id)
    )
    if err:
        msg = str(err.get_json()['message']) if hasattr(err, 'get_json') else str(err)
        return jsonify({'error': msg}), 400
    return jsonify({'status': 'ok'})

@app.route('/api/przedmioty_wizyta/<int:przedmiot_id>/<int:wizyta_id>', methods=['DELETE'])
def delete_przedmioty_wizyta(przedmiot_id, wizyta_id):
    err = safe_execute_db(
        'DELETE FROM Przedmioty_wizyta WHERE przedmiot_id=? AND wizyta_id=?',
        (przedmiot_id, wizyta_id)
    )
    if err:
        msg = str(err.get_json()['message']) if hasattr(err, 'get_json') else str(err)
        return jsonify({'error': msg}), 400
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
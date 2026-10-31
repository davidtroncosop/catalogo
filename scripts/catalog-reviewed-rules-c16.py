"""Prices read by hand from the printed C16 pages, for codes the layout parser
cannot pair with one price (shade grids, shared prices). One row per group:
(magazine, page, code regex matched in full, product family for missing official titles, price, regular price)."""


def codes(*values):
    return '(?:' + '|'.join(values) + ')$'


RULES = [
    # Natura p. 82: Una bases
    ('natura', 82, codes('1815(09|1[0-9]|2[01])'), 'Base facial stick Una FPS 50 12 g', 16990, 16990),
    ('natura', 82, codes('1081(2[5-9]|3[0-8]|4[24]|50)'), 'Base matte Una 30 ml', 14990, 14990),
    ('natura', 82, codes('1277(6[0-8]|7[2-7])'), 'Base powder Una 20 g', 21990, 21990),
]
RULES += [
    # Natura p. 78: Una HD liquid foundation, 30% off, refills at list price
    ('natura', 78, codes('1916(1[7-9]|2[0-9]|3[0-9])', '193846'), 'Base líquida HD Una 30 ml', 15390, 21990),
    ('natura', 78, codes('1735(9[2-9])', '1736(0[0-9]|1[0-2])'), 'Repuesto base líquida HD Una 30 ml', 15290, 15290),
    # Natura p. 84: shade grids; brushes priced for one unit ("llevando 1")
    ('natura', 84, codes('1101(8[1-9]|9[0-8])'), 'Base sérum nude me Una 30 ml', 22990, 22990),
    ('natura', 84, codes('134778', '1350(2[3-8]|3[45]|4[27])'), 'Base tint extremo confort Una FPS 40 30 ml', 14990, 14990),
    ('natura', 84, codes('55104', '109002', '105713'), 'Pincel Una', 10390, 12290),
]
RULES += [
    # Natura p. 88: lips
    ('natura', 88, codes('167296', '9350[456]', '9253[016]', '92526', '9252[059]', '2053(23|40)'), 'Labial CC hidratante FPS 25 Una 3,8 g', 11990, 11990),
    ('natura', 88, codes('97701', '1727[56]', '17352', '97700'), 'Labial extremo confort FPS 25 Una 3,8 g', 9990, 9990),
    ('natura', 88, codes('10629[46]'), 'Sérum labial Una 1,8 g', 10990, 10990),
    ('natura', 88, codes('20442[9]', '20443[024]'), 'Lápiz labial retráctil PRO Una 350 mg', 9990, 9990),
    # Natura p. 66: Chronos 40 g creams; their refills are 30% off (18.390 / 40 g = 45.975 x 100 g)
    ('natura', 66, codes('13459[23]', '13472[5]', '135032', '13469[357]', '13503[69]', '135027'), 'Crema antiseñales Chronos 40 g', 32990, 32990),
    ('natura', 66, codes('13459[0145]', '134585', '134589', '13470[0]', '134587', '134723', '134694'), 'Repuesto crema antiseñales Chronos 40 g', 18390, 26290),
]
RULES += [
    # Natura p. 100: Faces
    ('natura', 100, codes('1161(8[8]|9[3-9])', '1162(0[0-4])', '114984'), 'Labial cremoso multimix Faces 3,5 g', 5990, 5990),
    ('natura', 100, codes('1065(3[45]|4[46]|51)'), 'Esmalte de uñas Faces 6 ml', 3990, 3990),
    # Natura p. 89: Una matte liquid lipstick, 30% off (140027 "nude 1" is sold apart at 11.990)
    ('natura', 89, codes('1400(1[7-9]|2[0-689]|3[0-3]|5[39])', '178889'), 'Labial matte intransferible Una 7 ml', 8390, 11990),
    # Natura p. 99: Faces lips
    ('natura', 99, codes('6422', '10735[9]', '10736[01]', '6319', '4960', '4953'), 'Labial color hidra Faces FPS 8 3,5 g', 6490, 6490),
    ('natura', 99, codes('111397', '111424', '111399'), 'Labial mate intransferible Faces 3,5 ml', 6990, 6990),
    ('natura', 99, codes('9619', '9586', '9583'), 'Lápiz para labios Faces 1,4 g', 4790, 4790),
    # Natura p. 80: Una compact powder 30% off; refill at list price
    ('natura', 80, codes('11640[1-6]'), 'Polvo compacto nude me Una 10 g', 13990, 19990),
    ('natura', 80, codes('11067[89]', '11068[0-4]'), 'Repuesto polvo compacto nude me Una 10 g', 13990, 13990),
]
RULES += [
    # Natura p. 93: Faces face
    ('natura', 93, codes('9432', '9456', '948[13]'), 'Rubor Faces 3 g', 7490, 7490),
    ('natura', 93, codes('8848', '888[25]'), 'Polvo compacto Faces 6,5 g', 9990, 9990),
    ('natura', 93, codes('9009', '9025', '9149'), 'Repuesto polvo compacto Faces 6,5 g', 7290, 7290),
    # Natura p. 91: Una 3D gel nail polish
    ('natura', 91, codes('1535[23]', '15479', '158(15|2[1-6])'), 'Esmalte de uñas 3D Gel Una 8 ml', 6990, 6990),
    # Natura p. 79: Una concealer, 30% off
    ('natura', 79, codes('1221(1[2-8]|2[0-2])'), 'Corrector cobertura extrema Una 8 ml', 7690, 10990),
    # Natura p. 171: Kaiak deodorants and Humor refill (list price; 50% only with a regular purchase)
    ('natura', 171, codes('18939[018]'), 'Desodorante antitranspirante roll-on Kaiak 75 ml', 8390, 8390),
    ('natura', 171, codes('56747', '56754'), 'Spray corporal perfumado Kaiak 100 ml', 10990, 10990),
    ('natura', 171, codes('56948', '56763', '56766', '56768'), 'Repuesto spray corporal perfumado 100 ml', 8890, 8890),
    # Natura p. 50: Ekos Frescor 150 ml; launches 20% off
    ('natura', 50, codes('199394', '7357[345]'), 'Ekos Frescor eau de toilette 150 ml', 23490, 23490),
    ('natura', 50, codes('75955', '220916'), 'Ekos Frescor eau de toilette 150 ml', 18790, 23490),
    ('natura', 50, codes('118997', '119000'), 'Repuesto Ekos Frescor eau de toilette 150 ml', 15990, 15990),
]
RULES += [
    # Avon p. 39: eyes
    ('avon', 39, codes('161425', '15866[6-9]', '158670'), 'Delineador retráctil para ojos 0,35 g', 5090, 5990),
    ('avon', 39, codes('18483[1-7]', '184840'), 'Delineador líquido para ojos 3 ml', 3690, 4390),
    ('avon', 39, codes('15862[2-4]', '15863[0147]', '158628'), 'Lápiz delineador para ojos o labios', 2690, 3690),
    ('avon', 39, codes('152766'), 'Máscara para pestañas Invisible 8 g', 5390, 6290),
    # Avon p. 32: Make Up + Care sérum foundations
    ('avon', 32, codes('1602(8[4-9]|9[0-4])'), 'Base sérum de maquillaje acabado natural FPS 30 30 ml', 8690, 14090),
    ('avon', 32, codes('1998(68|80|85|87|95|97|98)', '199901'), 'Base sérum matte FPS 30 30 ml', 7990, 13990),
]
RULES += [
    # Avon p. 18: Power Stay nail polish
    ('avon', 18, codes('15276[79]', '1527(7[0-8]|8[0-3])'), 'Esmalte para uñas Power Stay efecto gel 9 ml', 4590, 6690),
    ('avon', 18, codes('152717'), 'Cobertura brillante esmalte Power Stay 9 ml', 4490, 8190),
    # Avon p. 21: Glimmerstick and mascaras
    ('avon', 21, codes('2015(7[79]|8[01])', '201603', '1708(2[0-5])'), 'Glimmerstick lápiz delineador retráctil', 4290, 6590),
    ('avon', 21, codes('161762'), 'Exxtravert Extreme Volume máscara para pestañas 9,5 ml', 9990, 13990),
    ('avon', 21, codes('135235'), 'Legendary Extension máscara alargadora 10 ml', 7790, 10590),
    ('avon', 21, codes('187355'), 'Máscara para pestañas Efecto Abanico 10 ml', 8490, 10890),
    # Avon p. 44: 10 Free nail polish, unit price (2x1 when taking two)
    ('avon', 44, codes('1361(2[589]|3[2-8]|4[02])', '15945[46]'), 'Esmalte para uñas 10 Free 7 ml', 3590, 3590),
    # Avon p. 17: Power Stay concealer and foundation
    ('avon', 17, codes('13531[17]'), 'Corrector líquido Power Stay 4 ml', 6590, 8990),
    ('avon', 17, codes('1556(69|7[0-3]|79|8[467])', '169187'), 'Base líquida de maquillaje Power Stay 30 ml', 11390, 14690),
]
RULES += [
    # Avon p. 13: liquid lipsticks
    ('avon', 13, codes('2046(79|8[0-4])'), 'Labial líquido 3 ml', 6990, 10190),
    ('avon', 13, codes('2515(5[89]|6[123])'), 'Labial líquido 4 ml', 6990, 10990),
    # Avon p. 14: eyes
    ('avon', 14, codes('158688'), 'Power Stay delineador líquido para ojos 1,2 ml', 5190, 7490),
    ('avon', 14, codes('135237'), 'Power Stay máscara de volumen para pestañas', 7990, 10990),
    ('avon', 14, codes('1675(29|30)', '1687(79|8[023])', '176932'), 'Lápiz delineador para ojos', 3490, 7190),
    # Avon p. 20: lips
    ('avon', 20, codes('1355(5[134])', '135090', '135089', '135552'), 'Lip Paint labial líquido 7 ml', 5890, 8890),
    ('avon', 20, codes('201699', '1355(48)', '13508[56]'), 'Lip Gloss brillo labial 7 ml', 5890, 8590),
    ('avon', 20, codes('15887[24]'), 'Lápiz labial de larga duración FPS 15 1,5 g', 3690, 7490),
    ('avon', 20, codes('251533'), 'Iconic Lipstick lápiz labial 2,4 g', 10390, 12990),
    # Avon p. 36 and 28: one offer per page
    ('avon', 36, codes('1987(0[0-8]|9[0-9])', '19869[0-9]'), 'Lápiz labial 3,6 g', 3790, 6890),
    ('avon', 28, codes('1356(4[0-9]|5[0-9]|6[0-9])'), 'Esmalte para uñas 9 ml', 3490, 6090),
]
RULES += [
    # Avon p. 116: men's aftershave and 90 ml hair & body shampoo
    ('avon', 116, codes('159679', '158865'), 'Acondicionador humectante para después de afeitar 100 ml', 2890, 5290),
    ('avon', 116, codes('170564', '155711', '169800', '195416', '18591[02]', '216785'), 'Shampoo para cabello y cuerpo 90 ml', 3950, 5290),
    # Avon p. 111: men's aerosol deodorant and 150 ml body cologne
    ('avon', 111, codes('127140', '158744', '13099[34]', '131159'), 'Desodorante en aerosol para el cuerpo 150 ml', 5290, 7090),
    ('avon', 111, codes('158619', '158650', '158789', '167527'), 'Colonia refrescante para el cuerpo 150 ml', 4190, 5590),
    # Avon p. 87: Anew
    ('avon', 87, codes('156923'), 'Anew crema facial C+ con vitamina C 30 ml', 16490, 23790),
    ('avon', 87, codes('168790'), 'Anew sérum facial AH+ con ácido hialurónico 30 ml', 16490, 22990),
    ('avon', 87, codes('187693'), 'Anew mascarilla ácido hialurónico 50 g', 7790, 10890),
    ('avon', 87, codes('168788'), 'Anew gel-crema facial hidratación y relleno 50 ml', 8990, 10990),
    ('avon', 87, codes('18775[12]'), 'Anew crema facial 30 ml', 12390, 18790),
    # Avon p. 35, 114, 41
    ('avon', 35, codes('13616[9]', '13617[245]'), 'Color Trend Matte D´Licious Stain labial líquido', 3990, 5990),
    ('avon', 35, codes('13558[05]'), 'Lápiz labial Kiss Hidra 3,6 g', 4390, 6990),
    ('avon', 114, codes('131003', '131135', '158640', '158652', '158753', '158790'), 'Desodorante en aerosol para el cuerpo para ella 75 ml', 2990, 5590),
    ('avon', 41, codes('244914'), 'Coffee Date paleta de sombras para párpados 4,2 g', 8990, 12990),
    ('avon', 41, codes('24498[678]'), 'Coffee Date lápiz labial Kiss Matte 3,6 g', 3790, 6890),
    ('avon', 41, codes('24496[78]'), 'Coffee Date multi stick 6,5 g', 5590, 8990),
]
RULES += [
    # Avon p. 42: Color Trend face
    ('avon', 42, codes('13544[36]'), 'Natural Real base líquida FPS 20 25 ml', 5290, 6990),
    ('avon', 42, codes('135425'), 'Matte Real base de maquillaje líquida mate 20 ml', 3690, 7490),
    ('avon', 42, codes('13546[9]', '135470'), 'Polvo compacto mate a prueba de agua FPS 12 8 g', 4490, 6990),
    # Avon p. 78: Anew
    ('avon', 78, codes('187689'), 'Anew Platinum sérum facial efecto lifting 30 ml', 16990, 23990),
    ('avon', 78, codes('153992'), 'Anew Reversalist crema facial 20 ml', 13890, 17990),
    ('avon', 78, codes('185925'), 'Anew Reversalist crema facial 30 ml', 10890, 20390),
    ('avon', 78, codes('15398[67]'), 'Anew Platinum crema facial 50 g', 14390, 24490),
    # Avon p. 99: Avon Care
    ('avon', 99, codes('161063', '16752[456]', '183284'), 'Avon Care crema para manos 75 ml', 3090, 3090),
    ('avon', 99, codes('161653'), 'Avon Care loción corporal 200 ml', 5090, 5090),
    # Avon p. 129 and 130: home sprays (refill: 1 for 3.490, 2 for 4.990)
    ('avon', 129, codes('16064[0-4]'), 'Rocío con atomizador 200 ml', 3990, 5990),
    ('avon', 130, codes('16166[2-6]'), 'Repuesto rocío atomizador 200 ml', 3490, 3490),
    # Avon p. 16: Power Stay lip tint
    ('avon', 16, codes('15870[57]', '15875[9]', '158760'), 'Power Stay Lip tinte labial 3 ml', 5190, 8490),
]
RULES += [
    # Avon p. 25: face
    ('avon', 25, codes('179117'), 'Ultra Color rubor en polvo 5 g', 10990, 13990),
    ('avon', 25, codes('18774[45]', '188011'), 'Polvo compacto 8 g', 8990, 9990),
    # Avon p. 31
    ('avon', 31, codes('17453[012]'), 'Polvo bronceador 6 g', 9190, 11390),
    ('avon', 31, codes('199158'), 'Máscara de volumen para pestañas 10 ml', 7990, 10990),
    # Avon p. 40
    ('avon', 40, codes('135274'), 'Mega BFF máscara para pestañas a prueba de agua 7 g', 3390, 6290),
    ('avon', 40, codes('19383[9]', '19384[01]'), 'Lápiz delineador 4,2 g', 5190, 8490),
    # Avon p. 67, 69, 73: fragrances
    ('avon', 67, codes('220975'), 'Musk For Men eau de toilette 150 ml', 6690, 8990),
    ('avon', 67, codes('13588[34]', '220974'), 'Musk+ eau de toilette para él 75 ml', 13190, 16490),
    ('avon', 69, codes('173884', '195445'), 'Colonia spray para el cuerpo', 5990, 7990),
    ('avon', 69, codes('15883[6]', '158890'), 'Eau de toilette', 10390, 12990),
    ('avon', 73, codes('195456'), 'Secret Fantasy colonia spray para el cuerpo', 5990, 7990),
    ('avon', 73, codes('158782', '158860', '201799'), 'Secret Fantasy eau de toilette para ella 50 ml', 10790, 13490),
]
RULES += [
    # Avon p. 79: Anew Reversalist 100 g pairs (day/night)
    ('avon', 79, codes('15398[23]'), 'Anew Reversalist crema facial', 11390, 18590),
    ('avon', 79, codes('15398[45]'), 'Anew crema facial', 13790, 20590),
    # Avon p. 83, 90, 91, 93, 95: one code per price block
    ('avon', 83, codes('185923'), 'Anew crema facial 20 g', 11290, 18290),
    ('avon', 83, codes('195280'), 'Anew crema facial 30 ml', 15990, 25790),
    ('avon', 83, codes('214534'), 'Anew crema facial 15 ml', 9990, 13690),
    ('avon', 83, codes('201819'), 'Crema para manos FPS 15 50 g', 6560, 8990),
    ('avon', 90, codes('21448[34]'), 'Limpieza facial Avon', 4390, 5190),
    ('avon', 90, codes('224050'), 'Tónico facial 200 ml', 4990, 6490),
    ('avon', 90, codes('214688'), 'Cuidado facial Avon', 3190, 6490),
    ('avon', 91, codes('214482'), 'Cuidado facial Avon', 5490, 7190),
    ('avon', 91, codes('202626'), 'Crema facial E+ con vitamina E', 9990, 12690),
    ('avon', 91, codes('136070'), 'Avon Care protector solar mate FPS 50 40 g', 5790, 6790),
    ('avon', 91, codes('169002'), 'Avon Care sérum facial 30 ml', 5890, 11290),
    ('avon', 93, codes('214479'), 'Crema facial 100 g', 5490, 7290),
    ('avon', 93, codes('214478'), 'Crema facial 100 g', 6490, 8690),
    ('avon', 93, codes('214477'), 'Crema facial 100 g', 6090, 8190),
    ('avon', 93, codes('203471'), 'Crema facial 100 g', 5790, 7590),
    ('avon', 95, codes('152077'), 'Gel exfoliante para puntos negros 50 g', 4990, 6990),
    ('avon', 95, codes('153254'), 'Jabón purificante con carbón 70 g', 3990, 4990),
    ('avon', 95, codes('152075'), 'Mascarilla facial negra con carbón 50 g', 4990, 5990),
    ('avon', 95, codes('152796'), 'Jabón de limpieza facial en gel 50 g', 5490, 6490),
]
RULES += [
    ('avon', 106, codes('16900[3789]'), 'Avon Care Intimate gel íntimo 250 ml', 4590, 4590),
    ('avon', 107, codes('206233'), 'Exfoliante para pies 100 ml', 3290, 4090),
    ('avon', 107, codes('196329'), 'Exfoliante para pies 80 g', 5190, 6490),
    ('avon', 107, codes('16881[23]'), 'Crema reparadora para pies 80 g', 4290, 5490),
    ('avon', 109, codes('158846'), 'Avon Care Men Essential gel para afeitar 150 ml', 4190, 5790),
    ('avon', 109, codes('158845'), 'Avon Care Men Essential shampoo, acondicionador y gel de baño', 6490, 7990),
    ('avon', 109, codes('158847'), 'Avon Care Men Essential bálsamo para después de afeitar', 3490, 5290),
    ('avon', 109, codes('187138'), 'Desodorante roll-on antitranspirante 3 en 1', 2990, 3290),
    ('avon', 128, codes('158379'), 'Set de pedicure Celebrate', 5240, 6990),
    ('avon', 128, codes('167504'), 'Set de stickers para decorar uñas', 5990, 9990),
    ('avon', 128, codes('171034'), 'Set de manicure Sparkling de 4 piezas', 5990, 7990),
    ('avon', 128, codes('133281'), 'Set de 6 decoradores de uñas', 5990, 6990),
]
RULES += [
    ('avon', 82, codes('153981'), 'Anew sérum facial', 12990, 25790),
    ('avon', 82, codes('172101'), 'Anew ampollas Power Protinol', 17990, 21990),
    ('avon', 82, codes('216790'), 'Anew Reversalist 15 g', 7990, 13690),
    ('avon', 150, codes('155708'), '300 Km/h Boost eau de toilette 100 ml', 13190, 21990),
    ('avon', 150, codes('187686'), 'Black Suede eau de toilette 100 ml', 14390, 23990),
    ('avon', 134, codes('158525'), 'Mochila Daniel', 14990, 33000),
    ('avon', 134, codes('171024'), 'Cartera crossbody Marcela', 15590, 25990),
    ('avon', 134, codes('193385'), 'Cartera bandolera Royal', 8790, 15990),
    ('avon', 134, codes('180222'), 'Bolsa Live Fest', 10990, 12990),
    ('avon', 38, codes('18239[012]'), 'Hidratante labial 4,5 g', 1890, 5090),
    ('avon', 26, codes('18774[678]'), 'Polvo compacto iluminador 8 g', 6990, 9990),
    ('avon', 56, codes('135892'), 'Pur Blanca Hope eau de toilette 75 ml', 8790, 10990),
    ('avon', 56, codes('158649'), 'Pasión Gitana eau de toilette 50 ml', 8790, 10990),
    ('avon', 56, codes('186461'), 'Timeless eau de toilette 50 ml', 9990, 13490),
]
RULES += [
    ('avon', 61, codes('135896'), 'Segno eau de parfum para él 100 ml', 22590, 32290),
    ('avon', 61, codes('13589[78]'), 'Segno eau de parfum para él 100 ml', 25790, 32290),
    ('avon', 80, codes('256466'), 'Anew sérum facial', 4590, 7990),
    ('avon', 80, codes('185924'), 'Anew sérum facial', 11990, 18990),
    ('avon', 80, codes('153980'), 'Anew Reversalist crema facial 50 ml', 15590, 28990),
    ('avon', 86, codes('185927'), 'Anew tónico facial antioxidante con vitamina C', 5990, 10990),
    ('avon', 86, codes('185926'), 'Anew crema radiante vitamina C FPS 50 50 g', 6990, 11990),
    ('avon', 86, codes('156924'), 'Anew crema facial 75 ml', 5990, 10890),
    ('avon', 88, codes('164081'), 'Protector solar Avon', 5990, 9990),
    ('avon', 88, codes('193812'), 'Anew protector solar 150 ml', 6990, 9990),
    ('avon', 88, codes('166402'), 'Anew Triple Protección FPS 50 protector solar', 10490, 15490),
    ('avon', 96, codes('131008'), 'Jabón de limpieza profunda 70 g', 2990, 4990),
    ('avon', 96, codes('152076'), 'Mascarilla facial arcilla rosada 50 g', 3990, 5990),
    ('avon', 96, codes('136041'), 'Clearskin loción tónica facial astringente', 3490, 6490),
    ('avon', 100, codes('19015[234]'), 'Avon Care Derma loción corporal 200 ml', 3190, 5590),
    ('avon', 108, codes('17492[9]', '174931'), 'Crema hidratante para pies 80 g', 3590, 5490),
    ('avon', 108, codes('174932'), 'Crema exfoliante intensiva para pies 80 g', 4590, 6990),
]


def single(slug, page, entries):
    """Rows for price blocks that print their own code: {code: (price, regular)}."""
    return [(slug, page, codes(code), f'Código {code}', price, regular) for code, (price, regular) in entries.items()]


RULES += single('avon', 110, {'136072': (5790, 8290), '136068': (4690, 6490), '136062': (8690, 10890)})
RULES += single('avon', 117, {'163471': (8590, 10790), '135137': (5790, 7390), '135138': (5790, 7390)})
RULES += single('avon', 121, {'135130': (4290, 5990), '135148': (6490, 6590), '135123': (6490, 6590)})
RULES += single('avon', 125, {'158403': (2990, 7990), '155166': (8390, 11990), '179735': (5990, 7990)})
RULES += single('avon', 126, {'155175': (4490, 5990), '180804': (4790, 7990), '134383': (1390, 6990)})
RULES += single('avon', 127, {'243261': (5690, 7690), '215642': (5170, 7390), '177539': (5990, 7990)})
RULES += single('avon', 133, {'196185': (8790, 12590), '196287': (12990, 24990), '171023': (7190, 11990)})
# Avon p. 135 prints 171027 on two different products (8.990 and 11.190): left to consult.
RULES += single('avon', 135, {'158376': (12590, 17990), '215365': (5990, 14990)})
RULES += single('avon', 141, {'178898': (4990, 8990), '178899': (4990, 8990), '199920': (5990, 8990)})
RULES += single('avon', 143, {'219315': (4990, 8990), '220147': (4990, 8990), '223329': (4990, 8990)})
RULES += single('avon', 144, {'210504': (4990, 8990), '213271': (5990, 8990), '210345': (4990, 8990)})
RULES += single('avon', 146, {'222048': (4990, 8990), '222049': (5990, 8990), '222054': (5990, 8990)})
RULES += single('avon', 34, {'256543': (3590, 7640), '256545': (3590, 7640)})
RULES += single('avon', 8, {'277065': (2690, 7790)})
RULES += single('avon', 22, {'222050': (5990, 8990)})
RULES += single('avon', 24, {'160378': (6590, 10890)})
RULES += single('avon', 46, {'163485': (20790, 25990)})
RULES += single('avon', 50, {'171980': (22690, 32490), '207417': (25990, 32490)})
RULES += single('avon', 52, {'169180': (22990, 28990)})
RULES += single('avon', 54, {'185906': (10190, 16990)})
RULES += single('avon', 58, {'135849': (17590, 21990)})
RULES += single('avon', 62, {'158859': (25490, 31890), '169181': (25490, 31890)})
RULES += single('avon', 63, {'134038': (17590, 21990), '158804': (17590, 21990)})
RULES += single('avon', 64, {'135820': (18490, 26490), '201546': (21190, 26490)})
RULES += single('avon', 66, {'155707': (9890, 16490), '175589': (9890, 16490)})
RULES += single('avon', 68, {'158698': (13190, 16490), '158809': (13190, 16490)})
RULES += single('avon', 72, {'196466': (7990, 13490)})
RULES += single('avon', 76, {'232073': (11190, 16890), '232076': (11190, 16890)})
RULES += single('avon', 92, {'224591': (3590, 7190)})
RULES += single('avon', 94, {'214480': (3590, 7190), '214481': (3590, 7190)})
RULES += single('avon', 98, {'161073': (3490, 5090)})
RULES += single('avon', 102, {'161068': (6990, 8690), '161077': (6990, 8690)})
RULES += single('avon', 103, {'222047': (6990, 8290)})
RULES += single('avon', 104, {'224604': (6390, 7690), '224574': (4390, 5090)})
RULES += single('avon', 118, {'193725': (4290, 8590)})
RULES += single('avon', 119, {'158617': (4090, 5690), '158638': (3690, 5190)})
RULES += single('avon', 120, {'195703': (5290, 6590), '198668': (8590, 10790)})
RULES += single('avon', 122, {'135121': (5990, 6590)})
RULES += single('avon', 132, {'158425': (2990, 7990)})
RULES += single('avon', 136, {'242615': (5990, 8090)})
RULES += single('avon', 138, {'250117': (5990, 8990)})
RULES += single('avon', 140, {'247120': (7690, 10990), '247111': (4990, 8990)})
RULES += single('avon', 142, {'219311': (6990, 8990)})
RULES += single('avon', 149, {'163483': (14290, 25990), '136077': (14090, 23590)})
RULES += [
    ('natura', 85, codes('7523[9]', '7524[12]'), 'Rubor intense me Una 6 g', 19490, 19490),
    ('natura', 85, codes('92576', '92584', '92595'), 'Repuesto rubor intense me Una 6 g', 13990, 13990),
    ('natura', 178, codes('12875[78]', '106421'), 'Colonia Naturé 100 ml', 6290, 8490),
    ('natura', 178, codes('14647[34]', '156244'), 'Repuesto colonia Naturé 100 ml', 6590, 6590),
    ('natura', 69, codes('18327[3458]', '247114', '247704'), 'Multiprotector aclarador Chronos FPS 50 50 ml', 20290, 20290),
    ('natura', 46, codes('20623[678]'), 'Humor eau de toilette 25 ml', 21990, 21990),
    ('natura', 46, codes('122948', '20834'), 'Humor eau de toilette unisex 75 ml', 33990, 33990),
]
RULES += single('natura', 131, {'154865': (3690, 4390), '154861': (3690, 4390), '156234': (3990, 4790), '277080': (13090, 17560)})
RULES += [
    # Natura p. 162: body cream refills, one-unit price ("llevando 1")
    ('natura', 162, codes('74849', '2819', '71596', '121961'), 'Repuesto crema nutritiva para cuerpo Tododia 400 ml', 8990, 11990),
    ('natura', 38, codes('11117[134]', '156226'), 'Kaiak eau de toilette masculino 100 ml', 34990, 34990),
    ('natura', 48, codes('9580[89]', '95810'), 'Águas de Natura colonia 150 ml', 17490, 17490),
    ('natura', 87, codes('1704[23]'), 'Delineador de cejas en fibra Una 1,1 ml', 10990, 10990),
    ('natura', 87, codes('7072[01]'), 'Lápiz kajal para ojos Una 1,14 g', 8290, 8290),
    ('natura', 87, codes('10755[56]'), 'Lápiz retráctil para cejas Una 2,5 g', 9590, 9590),
    ('natura', 157, codes('13457[45]'), 'Jabones en barra puro vegetal Ekos 4 x 100 g', 9890, 13190),
    ('natura', 157, codes('12979[79]'), 'Jabones en barra puro vegetal Ekos 4 x 100 g', 13190, 13190),
    ('natura', 95, codes('8950[0-3]'), 'Sombra trío Faces 3 g', 5990, 5990),
    # Natura p. 176: Mamá y Bebé refills, one-unit price ("llevando 1")
    ('natura', 176, codes('92802'), 'Repuesto jabón líquido Mamá y Bebé 200 ml', 4690, 5890),
    ('natura', 176, codes('92791'), 'Repuesto shampoo Mamá y Bebé 200 ml', 3990, 5090),
    ('natura', 176, codes('106418'), 'Repuesto loción hidratante Mamá y Bebé 200 ml', 4390, 5490),
]
RULES += single('natura', 175, {'92786': (8990, 8990), '92798': (5590, 5590), '97955': (8990, 8990)})
# Sale amounts drawn as images, recovered from the printed unit price and
# checked against the advertised discount (e.g. 5.193 x 100 ml x 150 ml = 7.790, 30% off 11.190).
RULES += single('natura', 61, {'135058': (7790, 11190), '137981': (8390, 11990)})
RULES += single('natura', 62, {'135037': (13990, 19990)})
RULES += single('natura', 63, {'169234': (19790, 30490), '169238': (15590, 23990)})
RULES += single('natura', 97, {'65830': (3790, 5490)})
RULES += single('natura', 56, {'150223': (8390, 8390), '150225': (8390, 8390)})
RULES += single('natura', 74, {'183307': (2590, 2590), '183308': (2590, 2590)})
RULES += single('natura', 75, {'117124': (5990, 5990), '128752': (8990, 8990)})
RULES += single('natura', 115, {'277002': (11090, 15980)})
RULES += single('natura', 117, {'276983': (11090, 15980)})
RULES += single('natura', 129, {'277014': (8690, 10980)})
RULES += single('natura', 137, {'277055': (10690, 15380), '112781': (6090, 7690), '112779': (6090, 7690)})
RULES += single('natura', 147, {'231779': (14390, 17990), '276964': (32390, 49870)})
RULES += single('natura', 159, {'277051': (26490, 40770)})
RULES += single('natura', 168, {'206230': (11990, 11990)})
RULES += single('natura', 174, {'177404': (11990, 15990)})
# Natura p. 172: 2179 is only sold in a 3x2 offer (5.590 each taking three); left to consult.
RULES += single('natura', 86, {'204760': (15990, 15990), '205322': (15990, 15990), '205326': (15990, 15990)})
RULES += single('natura', 179, {'249118': (4990, 5990)})
RULES += single('natura', 180, {'200046': (11990, 14990)})
RULES += single('natura', 181, {'227041': (9790, 13990)})
RULES += single('natura', 182, {'262988': (4990, 5990)})
RULES += [('avon', 76, codes('2320(6[0-9]|7[0-9])'), 'Anew protector solar facial stick FPS 50', 11190, 16890)]
RULES += single('casa-estilo', 16, {'158457': (135000, 225000)})

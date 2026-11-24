"""Prices read by hand from the printed C18 pages, for codes the layout parser
cannot pair with one price (shade grids, shared prices, refills next to the
full product). One row per group:
(magazine, page, code regex matched in full, product family for missing official titles, price, regular price).

Multi-buy offers ("llevando 2", "2x1", "3x2") use the price for one unit."""


def codes(*values):
    return '(?:' + '|'.join(values) + ')$'


def single(slug, page, prices):
    return [(slug, page, codes(code), f'Código {code}', sale, regular) for code, (sale, regular) in prices.items()]


RULES = [
    # Natura p. 102: Una bases; HD refills share the grid with the full product
    ('natura', 102, codes('1101(8[1-9]|9[0-8])'), 'Base sérum nude me Una 30 ml', 22990, 22990),
    ('natura', 102, codes('1916(1[7-9]|2[0-9]|3[0-9])', '193846'), 'Base líquida HD Una 30 ml', 21990, 21990),
    ('natura', 102, codes('1735(9[0-9])', '1736(0[0-9]|1[0-2])'), 'Repuesto base líquida HD Una 30 ml', 15290, 15290),
    # Natura p. 104: stick, compact powder and refills, loose powder
    ('natura', 104, codes('1815(0[0-9]|1[0-9]|2[0-1])'), 'Base facial stick Una FPS 50 12 g', 16990, 16990),
    ('natura', 104, codes('11640[1-5]'), 'Polvo compacto nude me Una 10 g', 19990, 19990),
    ('natura', 104, codes('1106(7[89]|8[0-4])'), 'Repuesto polvo compacto nude me Una 10 g', 13990, 13990),
    ('natura', 104, codes('165384', '165814'), 'Polvo suelto Una 8 g', 19490, 19490),
    # Natura p. 93: Chronos 40 g gels and their refills
    ('natura', 93, codes('134592', '134593', '134725', '135032', '134693', '135036', '134697', '135027', '134695', '135039'),
     'Gel crema antiseñales Chronos 40 g', 32990, 32990),
    ('natura', 93, codes('134591', '134595', '134585', '134589', '134700', '134587', '134723', '134590', '134694', '134594'),
     'Repuesto gel crema antiseñales Chronos 40 g', 26290, 26290),
    # Natura p. 103: highlighter, blush and refills
    ('natura', 103, codes('21454'), 'Iluminador marmolizado Una 3,5 g', 9890, 15290),
    ('natura', 103, codes('24865'), 'Repuesto iluminador marmolizado Una 3,5 g', 10790, 10790),
    ('natura', 103, codes('105713'), 'Pincel PRO iluminador Una', 12290, 12290),
    ('natura', 103, codes('7523[9]', '7524[12]'), 'Rubor intense me Una 6 g', 13590, 19490),
    ('natura', 103, codes('92584', '92576', '92595'), 'Repuesto rubor intense me Una 6 g', 13990, 13990),
    # Natura p. 107: palettes and radiance blush
    ('natura', 107, codes('20593[4]', '17111[345]'), 'Pro palette Una 7 g', 24990, 24990),
    ('natura', 107, codes('205326', '205322', '204760'), 'Rubor radiance Una 5 ml', 15990, 15990),
    # Natura p. 109: gloss, 60% off the second unit; one unit is 11.990
    ('natura', 109, codes('20533[789]', '205329', '1648(2[0-6])'), 'Gloss labial hidratación activa Una 5 ml', 11990, 11990),
]
RULES += [
    # Natura p. 110: lips
    ('natura', 110, codes('92526', '93506', '92529', '167296', '205340', '205323', '92525', '93504', '93505', '92530', '92520', '92536', '92531'),
     'Labial CC hidratante FPS 25 Una 3,8 g', 11990, 11990),
    ('natura', 110, codes('17352', '17276', '97700', '97701', '17275'), 'Labial extremo confort FPS 25 Una 3,8 g', 9990, 9990),
    ('natura', 110, codes('2053(3[0134]|2[15])'), 'Labial blur Una 5 ml', 11990, 11990),
    # Natura p. 111
    ('natura', 111, codes('1400(1[7-9]|2[0-9]|3[0-3]|5[39])', '178889'), 'Labial matte intransferible Una 7 ml', 11990, 11990),
    ('natura', 111, codes('20443[0-4]', '204429'), 'Lápiz labial retráctil PRO Una 350 mg', 9990, 9990),
    ('natura', 111, codes('10629[46]'), 'Sérum labial Una 1,8 g', 10990, 10990),
    # Natura p. 112-113: eyes and nails
    ('natura', 112, codes('7072[01]'), 'Lápiz kajal para ojos Una 1,14 g', 8290, 8290),
    ('natura', 113, codes('10755[56]'), 'Lápiz retráctil para cejas Una 2,5 g', 9590, 9590),
    ('natura', 113, codes('1704[23]'), 'Delineador de cejas en fibra Una 1,1 ml', 10990, 10990),
    ('natura', 113, codes('1582[0-3]', '15479', '15815', '1535[23]'), 'Esmalte de uñas 3D gel Una 8 ml', 6990, 6990),
]
RULES += [
    # Natura p. 115: Faces face
    ('natura', 115, codes('11668[89]', '11669[0134]'), 'Corrector checkmatte Faces 10 g', 5490, 5490),
    ('natura', 115, codes('9456', '9481', '9483', '9432'), 'Rubor Faces 3 g', 7490, 7490),
    ('natura', 115, codes('8848', '8882', '8885'), 'Polvo compacto Faces 6,5 g', 9990, 9990),
    ('natura', 115, codes('9025', '9149'), 'Repuesto polvo compacto Faces 6,5 g', 7290, 7290),
    # Natura p. 119: Faces lips; one unit of the matte liquid lipstick is 6.990
    ('natura', 119, codes('17772[02]', '111399', '177716', '111397', '111424'), 'Labial mate intransferible Faces 5,5 ml', 6990, 6990),
    ('natura', 119, codes('11620[034]', '116195', '114984', '116199', '116193'), 'Labial cremoso multimix Faces 3,5 g', 5990, 5990),
    ('natura', 119, codes('17510[35]', '17511[12]'), 'Gloss labial Faces 3,9 g', 6990, 6990),
    # Natura p. 120: Faces lips and nails (nails 3.990 for one or two units)
    ('natura', 120, codes('6422', '10735[9]', '10736[01]', '4953', '6319', '4960'), 'Labial color hidra FPS 8 Faces 3,5 g', 6490, 6490),
    ('natura', 120, codes('9619', '9586', '9583'), 'Lápiz para labios Faces 1,4 g', 4790, 4790),
    ('natura', 120, codes('17815[67]', '178161'), 'Labial líquido mate Faces 5,5 ml', 6990, 6990),
    ('natura', 120, codes('10653[458]', '10654[346]', '10655[3]', '17816[023]'), 'Esmalte de uñas Faces 6 ml', 3990, 3990),
    # Natura p. 87: Chronos Derma
    ('natura', 87, codes('183278', '247704', '183275', '247114', '183274'), 'Multiprotector aclarador FPS 50 Chronos 50 ml', 14190, 20290),
    ('natura', 87, codes('169222'), 'Sérum intensivo multiaclarador de manchas Chronos 30 ml', 26290, 37690),
    ('natura', 87, codes('169235'), 'Repuesto sérum intensivo multiaclarador Chronos 30 ml', 29990, 29990),
    ('natura', 87, codes('179453'), 'Mini sérum intensivo multiaclarador Chronos 10 ml', 13890, 13890),
]
RULES += [
    # Natura gifts: reference price is the sum of the printed reference prices
    ('natura', 13, codes('269975', '269959'), 'Regalo Una Elegance con labial', 41990, 64980),
    ('natura', 37, codes('269925', '269949'), 'Regalo Una rutina maquillaje', 24990, 34270),
    # Natura p. 41: the price is printed on p. 40 ($36.290, 45% off two 40 g gels at $32.990)
    ('natura', 41, codes('2700(0[24]|1[256])'), 'Regalo rutina Chronos antiseñales día y noche', 36290, 65980),
    ('natura', 49, codes('204118'), 'Bolsa de regalo mini Natura', 530, 530),
    ('natura', 49, codes('204120'), 'Bolsa de regalo pequeña Natura', 590, 590),
]
RULES += [
    # Natura pp. 53-55: Faces promos, price for one unit
    ('natura', 53, codes('177719', '177725'), 'Delineador retráctil de ojos Faces 280 mg', 6990, 6990),
    ('natura', 54, codes('17815[267]'), 'Labial líquido mate Faces 5,5 ml', 6990, 6990),
    ('natura', 55, codes('10654[3]', '106538', '106553', '17816[023]'), 'Esmalte de uñas Faces 6 ml', 3990, 3990),
    ('natura', 67, codes('204458', '11658[234]'), 'Luna eau de toilette 75 ml', 36990, 36990),
]
RULES += [
    # Natura perfumery grids
    ('natura', 68, codes('83322', '44171', '173421'), 'Ilía eau de parfum femenino 50 ml', 40990, 40990),
    ('natura', 74, codes('20834', '122948'), 'Humor eau de toilette unisex 75 ml', 33990, 33990),
    ('natura', 74, codes('20623[678]'), 'Humor eau de toilette 25 ml', 21990, 21990),
    ('natura', 79, codes('20337[35]'), 'Ekos Frescor eau de toilette 150 ml', 16390, 23490),
    ('natura', 81, codes('91204'), 'Tododia body splash mango rosa y agua de coco 200 ml', 11790, 14790),
    ('natura', 81, codes('100679', '72198', '76383', '72197'), 'Tododia body splash 200 ml', 14790, 14790),
    # Natura p. 80: Ekos Frescor 150 ml and refills (73572 castaña, 118996 its refill)
    ('natura', 80, codes('199394', '73573', '73575', '220916', '73572'), 'Ekos Frescor eau de toilette 150 ml', 23490, 23490),
    ('natura', 80, codes('119000', '119001', '118996'), 'Repuesto Ekos Frescor eau de toilette 150 ml', 15990, 15990),
]
RULES += [
    ('natura', 83, codes('286391'), 'Kit Homem cabellos: tónico capilar y pomada modeladora', 15290, 21980),
    ('natura', 83, codes('15022[35]'), 'Desodorante antitranspirante roll-on Homem 75 ml', 8390, 8390),
    ('natura', 86, codes('190899'), 'Polvo de limpieza enzimático Chronos Derma 50 g', 10490, 14990),
    ('natura', 86, codes('190898'), 'Repuesto doble esencia multiaclaradora Chronos Derma 100 ml', 13990, 19990),
    ('natura', 132, codes('280373'), 'Kit antiseñales completo Lumina', 17490, 26970),
    ('natura', 132, codes('280362'), 'Kit antiseñales básico Lumina', 11590, 16580),
    ('natura', 136, codes('147449', '147401'), 'Lumina antioleosidad 300 ml', 6590, 8290),
    ('natura', 136, codes('147442', '147445'), 'Repuesto Lumina antioleosidad 300 ml', 6490, 6490),
    ('natura', 136, codes('280330'), 'Kit antioleosidad Lumina', 11590, 16580),
]
RULES += [
    ('natura', 148, codes('173585'), 'Repuesto shampoo Tododia cabello rizado 300 ml', 3690, 4390),
    ('natura', 148, codes('173589'), 'Repuesto acondicionador Tododia cabello rizado 280 ml', 3690, 4390),
    ('natura', 148, codes('173586'), 'Repuesto crema para peinar Tododia cabello rizado 280 ml', 3990, 4790),
    ('natura', 148, codes('280354'), 'Kit Tododia mora y aceite de coco', 10090, 13570),
    ('natura', 155, codes('103380'), 'Crema nutritiva Tododia mango rosa y agua de coco 400 ml', 11990, 14990),
    ('natura', 155, codes('103382'), 'Repuesto crema nutritiva Tododia mango rosa y agua de coco 400 ml', 9590, 11990),
    ('natura', 158, codes('280390'), 'Kit Tododia mango rosa completo', 26490, 40770),
    ('natura', 158, codes('280341'), 'Kit Tododia mango rosa nutritivo', 18790, 26980),
    # Natura p. 160: liquid soap refills, one unit 4.990 (6.690 regular)
    ('natura', 160, codes('5871', '5877'), 'Repuesto jabón líquido Tododia 300 ml', 4990, 6690),
    ('natura', 160, codes('2831', '2834'), 'Jabones en barra Tododia 5 unidades de 90 g', 10990, 10990),
    ('natura', 160, codes('5852', '5857'), 'Jabón líquido corporal Tododia 300 ml', 8290, 8290),
    ('natura', 160, codes('74897', '74900'), 'Crema nutritiva para cuerpo Tododia 400 ml', 14990, 14990),
    ('natura', 160, codes('2819', '2825'), 'Repuesto crema nutritiva para cuerpo Tododia 400 ml', 11990, 11990),
]
RULES += [
    # Natura p. 167: Ekos liquid soaps, one unit
    ('natura', 167, codes('70396', '70398'), 'Jabón líquido gel Ekos 195 ml', 5390, 7190),
    ('natura', 167, codes('19949', '70392'), 'Jabón líquido exfoliante Ekos 185 ml', 5490, 7390),
    ('natura', 167, codes('98767'), 'Jabón líquido exfoliante tukumá Ekos 185 ml', 9190, 9190),
    ('natura', 167, codes('70408'), 'Jabón líquido cremoso castaña Ekos 195 ml', 8990, 8990),
    ('natura', 167, codes('70410'), 'Jabón líquido gel maracuyá Ekos 195 ml', 7190, 8990),
    ('natura', 167, codes('70405'), 'Jabón líquido exfoliante maracuyá Ekos 185 ml', 7290, 9190),
    # Natura p. 174: Tododia deodorants
    ('natura', 174, codes('189409'), 'Desodorante roll-on Tododia mango rosa y agua de coco 70 ml', 8390, 8390),
    ('natura', 174, codes('199381'), 'Desodorante en crema Tododia mango rosa y agua de coco 50 g', 6190, 6190),
    ('natura', 174, codes('18944[3789]', '189452', '190851', '204445'), 'Desodorante roll-on antitranspirante Tododia 70 ml', 8390, 8390),
    ('natura', 174, codes('9651[569]', '100530'), 'Desodorante antitranspirante en crema Tododia 80 g', 8390, 8390),
    # Natura p. 176: body sprays and roll-on
    ('natura', 176, codes('56747', '56754'), 'Spray corporal perfumado Kaiak 100 ml', 8190, 10990),
    ('natura', 176, codes('56757', '56744'), 'Spray corporal perfumado Humor 100 ml', 10990, 10990),
    ('natura', 176, codes('56948', '56763', '56768', '56766'), 'Repuesto spray corporal perfumado 100 ml', 8890, 8890),
    ('natura', 176, codes('18939[018]'), 'Desodorante antitranspirante roll-on invisible Kaiak 75 ml', 8390, 8390),
    ('natura', 178, codes('178865'), 'Gel hidratante post solar Natura Solar 120 g', 8990, 11990),
]
RULES += [
    ('natura', 180, codes('92807'), 'Aceite para embarazadas Mamá y Bebé 200 ml', 6590, 8290),
    ('natura', 180, codes('92808'), 'Hidratante preventivo de estrías Mamá y Bebé 200 ml', 8290, 8290),
    # Natura p. 182: Naturé
    ('natura', 182, codes('106496'), 'Hidratante corporal Naturé 125 ml', 8990, 8990),
    ('natura', 182, codes('102406', '102404'), 'Naturé cabellos 250 ml', 6390, 6390),
    ('natura', 182, codes('102407', '102405'), 'Repuesto Naturé cabellos 250 ml', 5090, 5090),
    ('natura', 182, codes('102416'), 'Jabones en barra hojas Naturé 3 unidades de 90 g', 7690, 7690),
    ('natura', 182, codes('102417'), 'Jabón líquido cuerpo y manos Naturé 250 ml', 5490, 5490),
    ('natura', 182, codes('128757', '128758', '106421'), 'Colonia Naturé 100 ml', 8490, 8490),
    ('natura', 182, codes('146473', '146474', '156244'), 'Repuesto colonia Naturé 100 ml', 6590, 6590),
    # Natura p. 183: Naturé hair; refills one unit 3.790, glycerin soap refill 3.390
    ('natura', 183, codes('102400', '102402', '102395', '102397'), 'Naturé cabellos 250 ml', 6390, 6390),
    ('natura', 183, codes('102401', '102396', '102403', '102398'), 'Repuesto Naturé cabellos 250 ml', 3790, 5090),
    ('natura', 183, codes('102418'), 'Repuesto jabón líquido de glicerina Naturé 250 ml', 3390, 4490),
    ('natura', 185, codes('221393'), 'Porta notebook Creer para Ver', 9690, 12990),
]
RULES += single('natura', 180, {'92798': (5590, 5590)})
RULES += [
    ('avon', 6, codes('204115'), 'Bolsa Avon kraft pequeña impresa', 390, 390),
    ('avon', 25, codes('135234'), 'Avon 5 in One Lash Genius máscara para pestañas 10 ml', 7490, 12530),
    ('avon', 31, codes('15887[24]'), 'Lápiz labial de larga duración FPS 15 1,5 g', 4990, 7490),
    ('avon', 31, codes('13508[56]', '201699', '135548'), 'Lip Gloss 7 ml', 5890, 8590),
    ('avon', 31, codes('251533'), 'Iconic Lipstick lápiz labial 2,4 g', 10390, 12990),
    ('avon', 34, codes('1356(51|66|60|48|63)'), 'Esmalte para uñas Ultra Color 9 ml', 4090, 6090),
    ('avon', 34, codes('1356(19|14|13)'), 'Esmalte para uñas Crushed Crystals 9 ml', 4590, 6690),
]
RULES += [
    # Avon p. 35: Ultra Color face
    ('avon', 35, codes('23133[6]', '231343'), 'Paleta facial en polvo 3 en 1 3,8 g', 10590, 15990),
    ('avon', 35, codes('18774[3-8]', '188011'), 'Polvo compacto facial Ultra Color 8 g', 8990, 9990),
    ('avon', 35, codes('179117'), 'Rubor en polvo Ultra Color 5 g', 10990, 13990),
    # Avon p. 36: Power Stay lips
    ('avon', 36, codes('24529[0-4]', '245289'), 'Delineador de labios Power Stay 0,289 g', 6290, 7790),
    ('avon', 36, codes('2046(79|8[0-4])'), 'Labial líquido Creamy Vinyl 7 ml', 6990, 10190),
    ('avon', 36, codes('17547[457]', '1719(6[89]|7[01])'), 'Lip Stylo crayon Power Stay 1,2 g', 6690, 10290),
    # Avon p. 37
    ('avon', 37, codes('2515(5[89]|6[123])'), 'Labial líquido Matte Glitter Power Stay 4 ml', 6990, 10990),
    ('avon', 37, codes('1355(5[89]|6[2-9]|70)'), 'Labial líquido acabado mate Power Stay 6 ml', 7490, 11990),
    # Avon p. 38
    ('avon', 38, codes('1527(6[79]|7[03457]|8[23])'), 'Esmalte para uñas efecto gel Power Stay 9 ml', 4590, 6690),
    ('avon', 38, codes('1556(69|7[0-3239]|8[4-7])', '169187'), 'Base líquida de maquillaje Power Stay 30 ml', 10190, 14690),
]
RULES += [
    ('avon', 39, codes('16878[0-3]', '16877[9]', '16752[9]', '167530', '176932'), 'Lápiz delineador en gel para ojos Power Stay 1,2 g', 5290, 7190),
    ('avon', 39, codes('135237'), 'Máscara de volumen a prueba de agua Power Stay 10 g', 7990, 10990),
    ('avon', 39, codes('158688'), 'Delineador líquido para ojos Power Stay 1,2 ml', 4390, 7490),
    ('avon', 41, codes('13531[127]'), 'Corrector líquido Power Stay 4 ml', 5190, 8990),
    # Avon p. 42: Make Up + Care
    ('avon', 42, codes('17453[012]'), 'Polvo facial mineral Make Up + Care 6 g', 9190, 11390),
    ('avon', 42, codes('199158'), 'Máscara de volumen para pestañas Make Up + Care 10 ml', 7990, 10990),
    ('avon', 42, codes('1998(68|80|85|87|95|97|98)', '199901'), 'Base de maquillaje Serum Matte FPS 30 30 ml', 8590, 13990),
    ('avon', 42, codes('16028[4-9]', '16029[014]'), 'Base serum de maquillaje acabado natural FPS 30 30 ml', 8690, 14090),
    ('avon', 43, codes('24443[3-68]'), 'Make Up + Care Peptide Sérum brillo labial 5,5 ml', 6290, 8890),
    ('avon', 43, codes('1527(46|42|34|41)'), 'Labial Hydramatic Radiante 3,6 g', 6990, 9990),
]
RULES += [
    ('avon', 46, codes('24436[12]'), 'Avon Alice iluminador facial 4,6 g', 7990, 10990),
    ('avon', 46, codes('244353'), 'Avon Alice iluminador corporal 5 g', 10990, 13990),
    ('avon', 49, codes('15862[2-48]', '1586(3[0147])'), 'Lápiz delineador Color Trend', 1590, 3690),
    ('avon', 49, codes('19383[9]', '19384[01]'), 'Paleta de sombras para párpados Color Trend 4,2 g', 4890, 8490),
    ('avon', 52, codes('1361(69|7[2-7])'), 'Matte D\'licious Stain labial líquido 4 ml', 3990, 5990),
    ('avon', 52, codes('213305'), 'Frutillita brillo labial 7 g', 4990, 4990),
    ('avon', 52, codes('1986(97)', '1987(0[0-8])'), 'Kiss Matte lápiz labial 3,6 g', 4290, 6890),
    ('avon', 59, codes('174515'), 'TTA The Moment eau de parfum 50 ml', 16190, 32490),
    # Avon p. 51: 2x1; one unit at the regular price
    ('avon', 51, codes('13558[0345]'), 'Kiss Hidra lápiz labial 3,6 g', 6990, 6990),
    # Avon p. 54: Color Trend Matte Real
    ('avon', 54, codes('13546[89]', '135470'), 'Color Trend Matte Real polvo compacto facial 8 g', 3490, 6990),
    ('avon', 54, codes('13544[3467]'), 'Color Trend Natural Real base de maquillaje líquida 20 ml', 5290, 6990),
    ('avon', 54, codes('13542[56]'), 'Color Trend Matte Real base de maquillaje líquida mate 20 ml', 4990, 7490),
]
RULES += [
    ('avon', 65, codes('174849'), 'Imari Original eau de toilette 50 ml', 10190, 16990),
    ('avon', 71, codes('135843'), '300 Km/h Electric eau de toilette 100 ml', 15390, 21990),
    ('avon', 71, codes('13584[679]', '155708'), '300 Km/h eau de toilette 100 ml', 17590, 21990),
    ('avon', 75, codes('131038'), 'Exclusive eau de parfum 75 ml', 15890, 26490),
    ('avon', 81, codes('135885'), 'Musk+ Instinct eau de toilette 75 ml', 9890, 16490),
    ('avon', 81, codes('193805', '220974'), 'Musk+ eau de toilette 75 ml', 11490, 16490),
]
RULES += [
    ('avon', 82, codes('201799', '158782'), 'Secret Fantasy eau de toilette 50 ml', 7990, 13490),
    ('avon', 82, codes('158860', '196466', '158858'), 'Secret Fantasy eau de toilette 50 ml', 10790, 13490),
    ('avon', 82, codes('195456', '195445', '173884'), 'Colonia spray para el cuerpo 125 ml', 5990, 7990),
    ('avon', 95, codes('156923'), 'Anew sérum facial antioxidante con vitamina C 30 ml', 13090, 23790),
    ('avon', 95, codes('187752'), 'Anew vitamina C repuesto sérum facial antioxidante 30 ml', 12390, 18790),
    ('avon', 97, codes('195280'), 'Anew corrector de manchas sérum facial 30 ml', 15990, 25790),
    ('avon', 97, codes('201819'), 'Anew corrector de manchas crema para manos FPS 15 50 g', 5900, 8990),
    ('avon', 97, codes('18592[12]'), 'Anew corrector de manchas crema facial 40 g', 12990, 19990),
    ('avon', 99, codes('195465'), 'Anew Triple Protección FPS 30 protector solar fluido facial 40 g', 8990, 15490),
    ('avon', 99, codes('191146'), 'Anew Triple Protección FPS 50 loción facial mate 40 g', 10490, 15490),
    ('avon', 99, codes('166402'), 'Anew Triple Protección FPS 50 loción facial con color 40 g', 10490, 15490),
]
RULES += [
    ('avon', 102, codes('169002'), 'Avon Care sérum facial hidratante multibeneficios 30 ml', 6990, 11290),
    ('avon', 102, codes('202626'), 'Avon Care sérum facial antiseñales 30 ml', 9990, 12690),
    ('avon', 102, codes('214482'), 'Avon Care labial hidratante 4,2 g', 5490, 7190),
    ('avon', 102, codes('136070'), 'Avon Care protector solar facial FPS 50 control de brillo 40 g', 5790, 6790),
    ('avon', 104, codes('203471'), 'Avon Care crema facial hidratante 100 g', 5790, 7590),
    ('avon', 104, codes('214481'), 'Avon Care crema facial hidratante matificante 100 g', 5490, 7190),
    ('avon', 104, codes('214478'), 'Avon Care crema facial antiseñales 100 g', 6490, 8690),
    ('avon', 104, codes('214479'), 'Avon Care crema facial nocturna 100 g', 5490, 7290),
    ('avon', 110, codes('176926'), 'Avon Care crema para manos cereza 75 g', 2490, 3090),
    ('avon', 110, codes('179426'), 'Avon Care loción corporal cereza 200 ml', 3990, 5090),
    ('avon', 110, codes('179427'), 'Avon Care loción corporal cereza 700 ml', 6990, 8690),
    ('avon', 110, codes('16107[134]', '197212', '161653'), 'Avon Care loción corporal 200 ml', 5090, 5090),
    ('avon', 111, codes('16106[8]', '161077'), 'Avon Care loción corporal 700 ml', 6990, 8690),
    ('avon', 111, codes('183284', '161063', '16752[46]', '195273'), 'Avon Care crema para manos 75 ml', 3090, 3090),
]
RULES += [
    ('avon', 115, codes('16900[45]'), 'Avon Care Intimate gel íntimo mini 125 ml', 2090, 2690),
    ('avon', 115, codes('16900[3789]'), 'Avon Care Intimate gel íntimo 250 ml', 3990, 4590),
    # Avon p. 121: one unit 2.990 (2.490 each taking two)
    ('avon', 121, codes('18713[78]'), 'Avon Care desodorante roll-on antitranspirante 3 en 1 48 ml', 2990, 3290),
    # Avon p. 123: 2x1; one unit at the regular price
    ('avon', 123, codes('158744', '13099[34]', '127140', '131159'), 'Desodorante en aerosol para el cuerpo 150 ml', 7090, 7090),
    ('avon', 125, codes('158790', '158640', '131135', '131003', '158652', '158753'), 'Desodorante en aerosol para el cuerpo para ella 75 ml', 4190, 5590),
    ('avon', 125, codes('180312', '152423', '131208', '152397', '190376', '17886[678]', '190382', '187352', '190385', '158729', '158722', '158665'),
     'Desodorante antitranspirante roll-on para ella', 2290, 3090),
]
RULES += [
    ('avon', 130, codes('13514[345]'), 'Advance Techniques óleo de tratamiento 90 ml', 8690, 10790),
    ('avon', 130, codes('13513[78]', '135945'), 'Advance Techniques sérum de tratamiento 30 ml', 5790, 7390),
    ('avon', 131, codes('193725'), 'Advance Techniques spray rizos fabulosos 200 ml', 6890, 8590),
    ('avon', 131, codes('163471'), 'Advance Techniques crema de tratamiento capilar 10 en 1 150 ml', 8590, 10790),
    ('avon', 131, codes('158617'), 'Cepillo desenredante', 4090, 5690),
    ('avon', 131, codes('158638'), 'Cepillo con espejo', 3690, 5190),
    ('avon', 131, codes('16176[0]', '161759'), 'Avon Care shampoo 1 L', 8490, 11290),
    ('avon', 134, codes('196199'), 'Set x8 esponjas de maquillaje con contenedor', 3790, 4990),
    ('avon', 134, codes('176725'), 'Set x2 pinzas para depilar', 4990, 5990),
    ('avon', 134, codes('215633'), 'Set x8 manicure Tulipanes', 5390, 7190),
    ('avon', 135, codes('171030'), 'Set x3 brochas + esponja', 9990, 19990),
    ('avon', 135, codes('242621'), 'Set x2 beauty blenders Irene', 3590, 5990),
    ('avon', 135, codes('232689'), 'Set x5 brochas eco', 12790, 21290),
]
RULES += [
    ('avon', 136, codes('158403'), 'Cepillo de baño Flores', 4790, 7990),
    ('avon', 136, codes('242656'), 'Diadema para cabello Zahara', 3990, 5390),
    ('avon', 136, codes('232623'), 'Cepillo cuadrado Eva', 5990, 8090),
    ('avon', 138, codes('155032'), 'Set manicure Trigo', 4790, 7990),
    ('avon', 138, codes('158533'), 'Guantes exfoliantes Rose Gold', 2990, 4990),
    ('avon', 138, codes('215634'), 'Lima removedora de vello', 3390, 5590),
    ('avon', 139, codes('16166[2-6]'), 'Rocío atomizador para telas 200 ml', 3490, 6990),
    ('avon', 139, codes('16064[0-4]'), 'Repuesto rocío para telas 200 ml', 4990, 5990),
    ('avon', 141, codes('158425'), 'Bandana para cabello colores', 2990, 7990),
]
RULES += [
    ('avon', 142, codes('178870'), 'Llavero pulsera Leopardo', 5990, 9990),
    ('avon', 142, codes('196185'), 'Set x2 llaveros + charms Euforia', 7990, 12590),
    ('avon', 142, codes('242662'), 'Cosmetiquera Amor', 8690, 10790),
    ('avon', 142, codes('180803'), 'Portacosméticos Leopardo', 9990, 15990),
    ('avon', 144, codes('193385'), 'Cartera bandolera Royal', 9990, 15990),
    ('avon', 144, codes('180222'), 'Bolsa live fest', 7790, 12990),
]
# Layout prices confirmed by hand; these rows add the regular price printed apart.
RULES += [
    ('avon', 58, codes('171980', '195463', '207417'), 'TTA eau de parfum 50 ml', 25990, 32490),
    ('avon', 66, codes('136091', '152799', '135857', '185906'), 'Imari eau de toilette 50 ml', 13490, 16990),
    ('avon', 150, codes('199920'), 'Colonia Avengers de Marvel 150 ml', 4990, 8990),
    ('avon', 150, codes('17889[89]'), 'Avengers de Marvel', 5990, 8990),
    ('avon', 151, codes('219311'), 'Colonia Spider-Man de Marvel 150 ml', 4990, 8990),
    ('avon', 151, codes('219313'), 'Gel para cabello Spider-Man de Marvel 100 g', 5990, 8990),
    ('avon', 156, codes('1587(05|07|59|60)'), 'Power Stay Lip Tinte labial 3 ml', 5190, 5190),
    ('casa-estilo', 9, codes('158449'), 'Camino de mesa Copos', 7990, 18990),
    ('casa-estilo', 16, codes('172906'), 'Pelota para masajes', 4790, 7990),
]
RULES += [('avon', 129, codes('135146', '135121'), 'Advance Techniques línea Nutrición Completa', 5290, 6590)]
RULES += [
    ('avon', 103, codes('224050'), 'Avon Care tónico facial agua de rosas 200 ml', 3990, 6490),
    ('avon', 103, codes('214484'), 'Avon Care agua micelar de limpieza facial 200 ml', 4390, 5190),
    ('avon', 103, codes('214688'), 'Avon Care gel exfoliante facial 80 g', 4990, 6490),
    ('avon', 114, codes('161076', '161070', '201477'), 'Avon Care loción corporal 700 ml', 8690, 8690),
]
RULES += [('avon', 147, codes('251566'), 'Colonia Cars 150 ml', 4990, 8990)]

-- =============================================================================
-- Seed 40 dummy customer accounts
-- Created dates spread across March 23 – April 3, 2026
-- All users get password: DummyPass123!
-- Idempotent: skips users whose email already exists
-- =============================================================================

DO $$
DECLARE
    rec RECORD;
    new_id UUID;
    hashed_pw TEXT;
BEGIN
    -- Hash the shared dummy password once
    hashed_pw := crypt('DummyPass123!', gen_salt('bf'));

    FOR rec IN
        SELECT *
        FROM (VALUES
            ('Juan',       'Santos',      '2026-03-23 08:22:00+08'),
            ('Maria',      'Reyes',       '2026-03-23 11:45:00+08'),
            ('Marco',      'Cruz',        '2026-03-23 17:30:00+08'),
            ('Sofia',      'Garcia',      '2026-03-24 09:10:00+08'),
            ('Miguel',     'Ramos',       '2026-03-24 13:55:00+08'),
            ('Ana',        'Mendoza',     '2026-03-24 19:08:00+08'),
            ('Rafael',     'Torres',      '2026-03-25 07:40:00+08'),
            ('Isabella',   'Flores',      '2026-03-25 10:15:00+08'),
            ('Gabriel',    'Gonzales',    '2026-03-25 14:32:00+08'),
            ('Camila',     'Bautista',    '2026-03-25 21:05:00+08'),
            ('Carlos',     'Villanueva',  '2026-03-26 08:50:00+08'),
            ('Andrea',     'Fernandez',   '2026-03-26 12:20:00+08'),
            ('Antonio',    'Martinez',    '2026-03-26 18:45:00+08'),
            ('Patricia',   'Lopez',       '2026-03-27 09:30:00+08'),
            ('Luis',       'Rivera',      '2026-03-27 15:12:00+08'),
            ('Carmen',     'Tan',         '2026-03-27 20:40:00+08'),
            ('Jose',       'Lim',         '2026-03-28 07:55:00+08'),
            ('Elena',      'Castillo',    '2026-03-28 11:28:00+08'),
            ('Pedro',      'Aquino',      '2026-03-28 16:05:00+08'),
            ('Luz',        'Dela Cruz',   '2026-03-28 22:18:00+08'),
            ('Andres',     'De Leon',     '2026-03-29 08:35:00+08'),
            ('Teresa',     'Aguilar',     '2026-03-29 13:42:00+08'),
            ('Manuel',     'Diaz',        '2026-03-29 19:55:00+08'),
            ('Cristina',   'Pascual',     '2026-03-30 09:18:00+08'),
            ('Francisco',  'Navarro',     '2026-03-30 14:50:00+08'),
            ('Rosario',    'Soriano',     '2026-03-30 20:30:00+08'),
            ('Eduardo',    'Valdez',      '2026-03-31 07:45:00+08'),
            ('Pilar',      'Mercado',     '2026-03-31 12:10:00+08'),
            ('Roberto',    'Salazar',     '2026-03-31 16:35:00+08'),
            ('Dolores',    'Romero',      '2026-03-31 21:50:00+08'),
            ('Alejandro',  'Santiago',    '2026-04-01 08:15:00+08'),
            ('Margarita',  'Gutierrez',   '2026-04-01 14:28:00+08'),
            ('Fernando',   'Morales',     '2026-04-01 19:42:00+08'),
            ('Esperanza',  'Medina',      '2026-04-02 09:05:00+08'),
            ('Ricardo',    'Hernandez',   '2026-04-02 11:38:00+08'),
            ('Beatriz',    'Jimenez',     '2026-04-02 15:55:00+08'),
            ('Ernesto',    'Perez',       '2026-04-02 20:12:00+08'),
            ('Gloria',     'Vargas',      '2026-04-03 08:40:00+08'),
            ('Guillermo',  'Ochoa',       '2026-04-03 13:25:00+08'),
            ('Cecilia',    'Dominguez',   '2026-04-03 18:50:00+08')
        ) AS t(first_name, last_name, created_at)
    LOOP
        -- Build email from name (lowercase, no spaces)
        DECLARE
            user_email TEXT := lower(
                replace(rec.first_name, ' ', '') || '.' ||
                replace(rec.last_name, ' ', '') || '@example.com'
            );
            ts TIMESTAMPTZ := rec.created_at::timestamptz;
        BEGIN
            -- Skip if email already exists in auth
            IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
                RAISE NOTICE 'Skipping existing user: %', user_email;
                CONTINUE;
            END IF;

            new_id := gen_random_uuid();

            -- 1) auth.users
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password,
                email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                created_at, updated_at,
                confirmation_token, recovery_token,
                email_change_token_new, email_change
            ) VALUES (
                '00000000-0000-0000-0000-000000000000'::uuid,
                new_id,
                'authenticated',
                'authenticated',
                user_email,
                hashed_pw,
                ts,                                                  -- confirmed immediately
                '{"provider": "email", "providers": ["email"]}'::jsonb,
                jsonb_build_object(
                    'first_name', rec.first_name,
                    'last_name',  rec.last_name,
                    'role',       'customer'
                ),
                ts, ts,
                '', '', '', ''
            );

            -- 2) auth.identities (required for Supabase login to work)
            INSERT INTO auth.identities (
                id, user_id, identity_data, provider, provider_id,
                last_sign_in_at, created_at, updated_at
            ) VALUES (
                new_id,                      -- id
                new_id,                      -- user_id
                jsonb_build_object(
                    'sub',   new_id::text,
                    'email', user_email
                ),
                'email',                     -- provider
                new_id::text,                -- provider_id
                ts, ts, ts
            );

            -- 3) user_profiles
            INSERT INTO user_profiles (
                id, first_name, last_name, email, role,
                total_orders, total_spent, loyalty_points,
                created_at, updated_at
            ) VALUES (
                new_id,
                rec.first_name,
                rec.last_name,
                user_email,
                'customer',
                0, 0, 0,
                ts, ts
            );

            RAISE NOTICE '✅ Created user: % % (%)', rec.first_name, rec.last_name, user_email;
        END;
    END LOOP;

    RAISE NOTICE '🎉 Dummy user seeding complete!';
END $$;


-- =============================================================================
-- Seed dummy room designs for ~25 of the dummy users
-- No images uploaded — room_image_url and render_url stay NULL
-- design_data references real product variants from the catalog
-- =============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_product_id UUID;
    v_variant_id UUID;
    v_variant_sku TEXT;
    v_design RECORD;
    v_furn RECORD;
    v_furniture_arr JSONB;
    v_design_id UUID;
BEGIN

    -- Loop through design definitions
    FOR v_design IN
        SELECT *
        FROM (VALUES
            -- (user_email, design_name, description, is_favorite, is_public, created_offset_hours, variant_skus_csv, room_type)
            ('juan.santos@example.com',      'My Living Room Setup',        'Planning the sofa and coffee table layout',    true,  false, 2,  'SOF-001-GRY,TBL-008-WHT',       'Living Room'),
            ('maria.reyes@example.com',       'Master Bedroom Plan',         'New bed and wardrobe arrangement',             true,  false, 4,  'BED-004-GRY,CAB-015-WHT',        'Bedroom'),
            ('maria.reyes@example.com',       'Living Area Ideas',           NULL,                                           false, false, 26, 'SOF-001-BRN,CHR-007-GRN',        'Living Room'),
            ('sofia.garcia@example.com',      'Home Office Design',          'Standing desk with office chair',              true,  true,  3,  'DSK-006-BLK,CHR-002-BLK',        'Office'),
            ('miguel.ramos@example.com',      'Dining Room Concept',         'Table and chairs for family dinners',          false, false, 8,  'TBL-003-OAK,CHR-013-GRY',        'Dining Room'),
            ('ana.mendoza@example.com',        'Cozy Living Room',           'Accent chair corner with coffee table',        true,  true,  5,  'CHR-007-GRN,TBL-008-WHT',        'Living Room'),
            ('rafael.torres@example.com',     'Kids Study Area',             'Desk setup for the kids',                      false, false, 6,  'DSK-011-PNK',                     'Study'),
            ('isabella.flores@example.com',   'Guest Bedroom',               'Simple bed and storage',                       true,  false, 3,  'BED-012-BLK,CAB-010-WAL',        'Bedroom'),
            ('isabella.flores@example.com',   'Entertainment Room',          'Display cabinet showcase',                     false, true,  30, 'CAB-005-BLK,SOF-009-BRN',        'Living Room'),
            ('gabriel.gonzales@example.com',  'Small Apartment Living',      'Compact furniture for studio',                 false, false, 12, 'SOF-001-GRY,TBL-008-WHT,CHR-007-GRN', 'Living Room'),
            ('carlos.villanueva@example.com', 'Office Upgrade',              'Ergonomic workspace redesign',                 true,  false, 5,  'DSK-006-BLK,CHR-002-BRN',        'Office'),
            ('andrea.fernandez@example.com',  'Sala Design',                 'Living room with L-shape sofa',                false, false, 7,  'SOF-001-BRN,TBL-008-WHT',        'Living Room'),
            ('patricia.lopez@example.com',    'Bedroom Makeover',            'Complete bedroom refresh',                     true,  true,  4,  'BED-004-GRY,CAB-015-WHT,TBL-014-GLD', 'Bedroom'),
            ('luis.rivera@example.com',        'Work From Home Setup',        NULL,                                           false, false, 9,  'DSK-006-BLK,CHR-002-BLK',        'Office'),
            ('carmen.tan@example.com',         'Condo Living Room',          'Minimal layout for small condo',               true,  false, 3,  'SOF-001-GRY,CHR-007-GRN',        'Living Room'),
            ('jose.lim@example.com',           'Bachelor Pad',               'Simple modern furniture',                      false, false, 15, 'SOF-009-BRN,TBL-008-WHT',        'Living Room'),
            ('elena.castillo@example.com',    'Family Dining Area',          'Dining set for six',                           true,  false, 6,  'TBL-003-OAK,CHR-013-GRY',        'Dining Room'),
            ('andres.deleon@example.com',     'Reading Nook',                'Accent chair and bookshelf',                   false, true,  4,  'CHR-007-GRN,CAB-010-WAL',        'Living Room'),
            ('teresa.aguilar@example.com',    'Bedroom for Two',             'King bed with side tables',                    true,  false, 8,  'BED-012-BLK',                     'Bedroom'),
            ('cristina.pascual@example.com',  'Modern Minimalist Living',    'Clean lines, few pieces',                      false, false, 5,  'SOF-001-GRY,TBL-008-WHT',        'Living Room'),
            ('francisco.navarro@example.com', 'Home Library Corner',         'Bookshelf with reading chair',                 true,  true,  3,  'CAB-010-WAL,CHR-007-GRN',        'Study'),
            ('eduardo.valdez@example.com',    'Studio Apartment Plan',       'Multi-purpose room layout',                    false, false, 10, 'SOF-001-BRN,DSK-006-BLK,BED-004-GRY', 'Studio'),
            ('pilar.mercado@example.com',     'Lounge Area',                 'Recliner and display cabinet',                 true,  false, 4,  'SOF-009-BRN,CAB-005-BLK',        'Living Room'),
            ('alejandro.santiago@example.com','Dining & Living Combo',       'Open plan room design',                        false, true,  7,  'TBL-003-OAK,CHR-013-GRY,SOF-001-GRY', 'Living Room'),
            ('margarita.gutierrez@example.com','Nursery Ideas',              'Simple and safe nursery',                      true,  false, 3,  'CAB-015-WHT',                     'Bedroom'),
            ('fernando.morales@example.com',  'Gaming Room',                 'Desk and chair for gaming setup',              true,  false, 6,  'DSK-006-BLK,CHR-002-BLK',        'Office'),
            ('esperanza.medina@example.com',  'Living Room Refresh',         NULL,                                           false, false, 11, 'SOF-001-GRY,CHR-007-GRN,TBL-008-WHT', 'Living Room'),
            ('ricardo.hernandez@example.com', 'Master Suite',                'Luxury bedroom concept',                       true,  true,  5,  'BED-012-BLK,CAB-015-WHT,TBL-014-GLD', 'Bedroom'),
            ('beatriz.jimenez@example.com',   'Compact Office',              'Small desk, big productivity',                 false, false, 3,  'DSK-011-PNK,CHR-002-BRN',        'Office'),
            ('gloria.vargas@example.com',     'Sunday Sala',                 'Comfortable family living room',               true,  false, 2,  'SOF-009-BRN,TBL-008-WHT,CHR-007-GRN', 'Living Room')
        ) AS t(user_email, design_name, description, is_favorite, is_public, created_offset_hours, variant_skus, room_type)
    LOOP
        -- Look up the user
        SELECT id INTO v_user_id FROM user_profiles WHERE email = v_design.user_email LIMIT 1;
        IF v_user_id IS NULL THEN
            RAISE NOTICE 'Skipping design for missing user: %', v_design.user_email;
            CONTINUE;
        END IF;

        -- Build the furniture JSON array from variant SKUs
        v_furniture_arr := '[]'::jsonb;

        FOR v_furn IN
            SELECT
                pv.id   AS vid,
                p.id    AS pid,
                p.name  AS product_name,
                pv.name AS variant_name,
                p.category,
                pv.sku,
                pv.price,
                pv.color,
                pv.material,
                pv.dimensions,
                pv.stock_quantity,
                p.image_url,
                -- Deterministic pseudo-random positions based on sku hash
                (5 + (abs(hashtext(pv.sku || 'x')) % 85))::numeric AS pos_x,
                (5 + (abs(hashtext(pv.sku || 'y')) % 85))::numeric AS pos_y,
                (abs(hashtext(pv.sku || 'r')) % 360)::numeric      AS rotation
            FROM unnest(string_to_array(v_design.variant_skus, ',')) AS sku_val
            JOIN product_variants pv ON pv.sku = sku_val
            JOIN products p ON p.id = pv.product_id
        LOOP
            v_furniture_arr := v_furniture_arr || jsonb_build_array(jsonb_build_object(
                'id',           v_furn.vid::text || '-' || extract(epoch from now())::bigint,
                'productId',    v_furn.pid,
                'name',         v_furn.product_name || ' (' || v_furn.color || ')',
                'category',     v_furn.category,
                'image',        v_furn.image_url,
                'price',        v_furn.price,
                'color',        v_furn.color,
                'material',     v_furn.material,
                'dimensions',   coalesce(v_furn.dimensions, ''),
                'stock',        v_furn.stock_quantity,
                'variantId',    v_furn.vid,
                'sku',          v_furn.sku,
                '_catalogId',   v_furn.vid,
                'position',     jsonb_build_object('x', v_furn.pos_x, 'y', v_furn.pos_y),
                'rotation',     v_furn.rotation,
                'scale',        1
            ));
        END LOOP;

        -- Skip if no variants matched at all
        IF jsonb_array_length(v_furniture_arr) = 0 THEN
            RAISE NOTICE '⚠️  No matching variants for design "%", skipping', v_design.design_name;
            CONTINUE;
        END IF;

        v_design_id := gen_random_uuid();

        INSERT INTO room_designs (
            id, user_id, name, description,
            room_image_url, render_url,
            design_data, is_favorite, is_public,
            created_at, updated_at
        ) VALUES (
            v_design_id,
            v_user_id,
            v_design.design_name,
            v_design.description,
            NULL,   -- no room photo uploaded
            NULL,   -- no render generated
            jsonb_build_object('furniture', v_furniture_arr),
            v_design.is_favorite,
            v_design.is_public,
            (SELECT created_at + (v_design.created_offset_hours || ' hours')::interval
             FROM user_profiles WHERE id = v_user_id),
            (SELECT created_at + (v_design.created_offset_hours || ' hours')::interval
             FROM user_profiles WHERE id = v_user_id)
        );

        RAISE NOTICE '✅ Created design "%" for %', v_design.design_name, v_design.user_email;
    END LOOP;

    RAISE NOTICE '🎉 Dummy room designs seeding complete!';
END $$;

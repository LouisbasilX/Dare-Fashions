--
-- PostgreSQL database dump
--

\restrict J02h5zKWZ6Ajy2mxG5hu2yo3f5Dj61cJuNtF4Ch63danLptObXEg5VjSgaWmnYH

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: consolidate_user_baskets(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.consolidate_user_baskets(p_user_id uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  target_id UUID;
  other RECORD;
  item RECORD;
BEGIN
  -- Find the oldest pending/invalid basket to keep
  SELECT id INTO target_id
  FROM baskets
  WHERE customer_id = p_user_id AND status IN ('pending', 'invalid')
  ORDER BY created_at ASC
  LIMIT 1;

  -- If none, create one
  IF target_id IS NULL THEN
    INSERT INTO baskets (customer_id, status)
    VALUES (p_user_id, 'pending')
    RETURNING id INTO target_id;
  ELSE
    -- Merge all other baskets into target
    FOR other IN SELECT id FROM baskets
      WHERE customer_id = p_user_id
        AND status IN ('pending', 'invalid')
        AND id != target_id
    LOOP
      FOR item IN SELECT * FROM basket_items WHERE basket_id = other.id LOOP
        INSERT INTO basket_items (basket_id, product_id, quantity, price_at_time)
        VALUES (target_id, item.product_id, item.quantity, item.price_at_time)
        ON CONFLICT (basket_id, product_id) DO UPDATE
        SET quantity = basket_items.quantity + EXCLUDED.quantity;
      END LOOP;
      DELETE FROM basket_items WHERE basket_id = other.id;
      DELETE FROM baskets WHERE id = other.id;
    END LOOP;
  END IF;

  RETURN target_id;
END;
$$;


--
-- Name: custom_access_token_hook(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.custom_access_token_hook(event jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
declare
  claims jsonb;
  user_role text;
begin
  -- Fetch the user's role from your customers table
  select role into user_role
  from public.customers
  where id = (event->>'user_id')::uuid;

  claims := event->'claims';

  if user_role is not null then
    -- Add the role to the JWT claims
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  else
    claims := jsonb_set(claims, '{user_role}', 'null');
  end if;

  -- Update the claims in the original event
  event := jsonb_set(event, '{claims}', claims);

  return event;
end;
$$;


--
-- Name: delete_basket_if_empty(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_basket_if_empty(p_basket_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  item_count int;
BEGIN
  SELECT COUNT(*) INTO item_count FROM basket_items WHERE basket_id = p_basket_id;
  IF item_count = 0 THEN
    DELETE FROM baskets WHERE id = p_basket_id;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;


--
-- Name: delete_guest_basket(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_guest_basket(p_guest_session_id text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  guest_basket RECORD;
BEGIN
  SELECT id INTO guest_basket
  FROM baskets
  WHERE guest_session_id = p_guest_session_id AND status IN ('pending', 'invalid')
  LIMIT 1;

  IF guest_basket.id IS NOT NULL THEN
    DELETE FROM basket_items WHERE basket_id = guest_basket.id;
    DELETE FROM baskets WHERE id = guest_basket.id;
  END IF;
END;
$$;


--
-- Name: get_customers_with_email(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_customers_with_email() RETURNS TABLE(id uuid, email text, role text, name text, phone text, state text, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, u.email, c.role, c.name, c.phone, c.state, c.created_at
  FROM customers c
  JOIN auth.users u ON c.id = u.id
  ORDER BY c.created_at DESC;
END;
$$;


--
-- Name: get_guest_session_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_guest_session_id() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT COALESCE(
    current_setting('request.headers', true)::json->>'x-guest-session-id',
    ''
  );
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.customers (id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM customers
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;


--
-- Name: mark_baskets_paid(uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.mark_baskets_paid(basket_ids uuid[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  bid UUID;
  basket_record RECORD;
  item_record RECORD;
  order_id UUID;
  new_basket_id UUID;
  basket_total INTEGER;
BEGIN
  FOREACH bid IN ARRAY basket_ids LOOP
    -- Get basket details (only pending baskets)
    SELECT * INTO basket_record
    FROM baskets
    WHERE id = bid AND status = 'pending';
    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    -- Check that all items have sufficient available stock
    FOR item_record IN
      SELECT bi.*, p.available, p.price, p.name, p.image_url, p.video_url
      FROM basket_items bi
      JOIN products p ON p.id = bi.product_id
      WHERE bi.basket_id = bid
    LOOP
      IF item_record.quantity > item_record.available THEN
        RAISE EXCEPTION 'Basket % contains product % with insufficient stock', bid, item_record.product_id;
      END IF;
    END LOOP;

    -- Deduct stock from products
    UPDATE products p
    SET available = p.available - bi.quantity
    FROM basket_items bi
    WHERE bi.basket_id = bid AND p.id = bi.product_id;

    -- Calculate total
    SELECT SUM(quantity * price_at_time) INTO basket_total
    FROM basket_items
    WHERE basket_id = bid;

    -- Insert into orders
    INSERT INTO orders (
      original_basket_id,
      customer_id,
      guest_session_id,
      customer_name,
      phone,
      state,
      total,
      paid_at
    ) VALUES (
      bid,
      basket_record.customer_id,
      basket_record.guest_session_id,
      basket_record.customer_name,
      basket_record.phone,
      basket_record.state,
      basket_total,
      now()
    ) RETURNING id INTO order_id;

    -- Insert order items (with product name, image snapshot, and video snapshot)
    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      quantity,
      price_at_time,
      subtotal,
      image_url,
      video_url
    )
    SELECT
      order_id,
      bi.product_id,
      p.name,
      bi.quantity,
      bi.price_at_time,
      bi.quantity * bi.price_at_time,
      p.image_url,
      p.video_url
    FROM basket_items bi
    JOIN products p ON p.id = bi.product_id
    WHERE bi.basket_id = bid;

    -- Mark original basket as paid
    UPDATE baskets
    SET status = 'paid', paid_at = now()
    WHERE id = bid;

    -- Create a NEW empty basket for the same customer/guest (without delivery_note)
    INSERT INTO baskets (
      customer_id,
      guest_session_id,
      status,
      customer_name,
      phone,
      state
    ) VALUES (
      basket_record.customer_id,
      basket_record.guest_session_id,
      'pending',
      NULL,
      NULL,
      NULL
    ) RETURNING id INTO new_basket_id;
  END LOOP;
END;
$$;


--
-- Name: match_products(public.vector, double precision); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.match_products(query_embedding public.vector, match_threshold double precision) RETURNS TABLE(id uuid, similarity double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    1 - (p.keywords_embedding <=> query_embedding) AS similarity
  FROM products p
  WHERE p.keywords_embedding IS NOT NULL
    AND 1 - (p.keywords_embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC;
END;
$$;


--
-- Name: merge_basket_items(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.merge_basket_items(source_basket_id uuid, target_basket_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  source_item RECORD;
  target_item RECORD;
BEGIN
  FOR source_item IN SELECT * FROM basket_items WHERE basket_id = source_basket_id LOOP
    SELECT id, quantity INTO target_item
    FROM basket_items
    WHERE basket_id = target_basket_id AND product_id = source_item.product_id;

    IF FOUND THEN
      UPDATE basket_items
      SET quantity = quantity + source_item.quantity
      WHERE id = target_item.id;
    ELSE
      INSERT INTO basket_items (basket_id, product_id, quantity, price_at_time)
      VALUES (target_basket_id, source_item.product_id, source_item.quantity, source_item.price_at_time);
    END IF;
  END LOOP;

  -- Delete source basket items and basket
  DELETE FROM basket_items WHERE basket_id = source_basket_id;
  DELETE FROM baskets WHERE id = source_basket_id;
END;
$$;


--
-- Name: merge_guest_basket(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.merge_guest_basket(p_guest_session_id text, p_user_id uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  guest_basket RECORD;
  target_id UUID;
  item RECORD;
BEGIN
  -- First, ensure user has a consolidated basket
  target_id := consolidate_user_baskets(p_user_id);

  -- Find guest basket
  SELECT * INTO guest_basket
  FROM baskets
  WHERE guest_session_id = p_guest_session_id AND status IN ('pending', 'invalid')
  LIMIT 1;

  IF guest_basket.id IS NOT NULL THEN
    -- Merge guest items into target
    FOR item IN SELECT * FROM basket_items WHERE basket_id = guest_basket.id LOOP
      INSERT INTO basket_items (basket_id, product_id, quantity, price_at_time)
      VALUES (target_id, item.product_id, item.quantity, item.price_at_time)
      ON CONFLICT (basket_id, product_id) DO UPDATE
      SET quantity = basket_items.quantity + EXCLUDED.quantity;
    END LOOP;

    -- Delete guest basket
    DELETE FROM basket_items WHERE basket_id = guest_basket.id;
    DELETE FROM baskets WHERE id = guest_basket.id;
  END IF;

  RETURN target_id;
END;
$$;


--
-- Name: merge_guest_baskets(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.merge_guest_baskets(p_guest_session_id text, p_user_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  guest_basket RECORD;
  user_basket_id UUID;
  user_basket RECORD;
  item RECORD;
  existing_item RECORD;
BEGIN
  -- Get the user's current pending basket (if any)
  SELECT id INTO user_basket_id
  FROM baskets
  WHERE customer_id = p_user_id AND status IN ('pending', 'invalid')
  ORDER BY created_at DESC
  LIMIT 1;

  -- Loop through all guest baskets (pending/invalid)
  FOR guest_basket IN
    SELECT * FROM baskets
    WHERE guest_session_id = p_guest_session_id AND status IN ('pending', 'invalid')
  LOOP
    -- If user has no pending basket, create one from this guest basket
    IF user_basket_id IS NULL THEN
      INSERT INTO baskets (customer_id, status, customer_name, phone, state, delivery_note)
      VALUES (p_user_id, guest_basket.status, guest_basket.customer_name, guest_basket.phone, guest_basket.state, guest_basket.delivery_note)
      RETURNING id INTO user_basket_id;

      -- Copy items
      FOR item IN
        SELECT * FROM basket_items WHERE basket_id = guest_basket.id
      LOOP
        INSERT INTO basket_items (basket_id, product_id, quantity, price_at_time)
        VALUES (user_basket_id, item.product_id, item.quantity, item.price_at_time);
      END LOOP;
    ELSE
      -- User has existing basket; merge items
      FOR item IN
        SELECT * FROM basket_items WHERE basket_id = guest_basket.id
      LOOP
        SELECT id, quantity INTO existing_item
        FROM basket_items
        WHERE basket_id = user_basket_id AND product_id = item.product_id;

        IF FOUND THEN
          UPDATE basket_items
          SET quantity = quantity + item.quantity
          WHERE id = existing_item.id;
        ELSE
          INSERT INTO basket_items (basket_id, product_id, quantity, price_at_time)
          VALUES (user_basket_id, item.product_id, item.quantity, item.price_at_time);
        END IF;
      END LOOP;
    END IF;

    -- Delete guest basket items and the basket itself
    DELETE FROM basket_items WHERE basket_id = guest_basket.id;
    DELETE FROM baskets WHERE id = guest_basket.id;
  END LOOP;

  -- Handle paid guest baskets: transfer ownership and update orders
  FOR guest_basket IN
    SELECT * FROM baskets
    WHERE guest_session_id = p_guest_session_id AND status = 'paid'
  LOOP
    UPDATE baskets SET customer_id = p_user_id, guest_session_id = NULL
    WHERE id = guest_basket.id;

    UPDATE orders SET customer_id = p_user_id
    WHERE original_basket_id = guest_basket.id AND customer_id IS NULL;
  END LOOP;

  -- Also update any remaining guest baskets (shouldn't exist) to user
  UPDATE baskets SET customer_id = p_user_id, guest_session_id = NULL
  WHERE guest_session_id = p_guest_session_id AND customer_id IS NULL;
END;
$$;


--
-- Name: merge_user_baskets(text, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.merge_user_baskets(p_guest_session_id text, p_user_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  target_basket_id UUID;
  guest_basket RECORD;
  other_basket RECORD;
  item RECORD;
  result JSONB;
  guest_item_count INT := 0;
  other_item_count INT := 0;
BEGIN
  -- Step 1: Get or create target basket for the user
  SELECT id INTO target_basket_id
  FROM baskets
  WHERE customer_id = p_user_id AND status IN ('pending', 'invalid')
  ORDER BY created_at ASC
  LIMIT 1;

  IF target_basket_id IS NULL THEN
    INSERT INTO baskets (customer_id, status)
    VALUES (p_user_id, 'pending')
    RETURNING id INTO target_basket_id;
  END IF;

  -- Step 2: Handle guest basket if session ID provided
  IF p_guest_session_id IS NOT NULL THEN
    SELECT * INTO guest_basket
    FROM baskets
    WHERE guest_session_id = p_guest_session_id AND status IN ('pending', 'invalid')
    LIMIT 1;

    IF guest_basket.id IS NOT NULL THEN
      -- Move items from guest basket to target
      FOR item IN SELECT * FROM basket_items WHERE basket_id = guest_basket.id LOOP
        INSERT INTO basket_items (basket_id, product_id, quantity, price_at_time)
        VALUES (target_basket_id, item.product_id, item.quantity, item.price_at_time)
        ON CONFLICT (basket_id, product_id) DO UPDATE
        SET quantity = basket_items.quantity + EXCLUDED.quantity;
        guest_item_count := guest_item_count + 1;
      END LOOP;

      -- Delete guest basket
      DELETE FROM basket_items WHERE basket_id = guest_basket.id;
      DELETE FROM baskets WHERE id = guest_basket.id;
    END IF;
  END IF;

  -- Step 3: Merge all other user baskets (except target)
  FOR other_basket IN
    SELECT id FROM baskets
    WHERE customer_id = p_user_id
      AND status IN ('pending', 'invalid')
      AND id != target_basket_id
  LOOP
    FOR item IN SELECT * FROM basket_items WHERE basket_id = other_basket.id LOOP
      INSERT INTO basket_items (basket_id, product_id, quantity, price_at_time)
      VALUES (target_basket_id, item.product_id, item.quantity, item.price_at_time)
      ON CONFLICT (basket_id, product_id) DO UPDATE
      SET quantity = basket_items.quantity + EXCLUDED.quantity;
      other_item_count := other_item_count + 1;
    END LOOP;

    DELETE FROM basket_items WHERE basket_id = other_basket.id;
    DELETE FROM baskets WHERE id = other_basket.id;
  END LOOP;

  -- Step 4: Build result
  result := jsonb_build_object(
    'target_basket_id', target_basket_id,
    'guest_items_merged', guest_item_count,
    'other_items_merged', other_item_count
  );

  RETURN result;
END;
$$;


--
-- Name: refresh_basket_validity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_basket_validity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_basket_id UUID;
  new_status TEXT;
BEGIN
  -- Determine the affected basket ID
  v_basket_id := COALESCE(NEW.basket_id, OLD.basket_id);

  -- Compute new status based on current availability
  SELECT
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM basket_items bi
        JOIN products p ON p.id = bi.product_id
        WHERE bi.basket_id = v_basket_id
          AND bi.quantity > p.available
      ) THEN 'invalid'
      ELSE 'pending'
    END INTO new_status;

  -- Update basket status if it's pending or invalid
  UPDATE baskets
  SET status = new_status
  WHERE id = v_basket_id
    AND status IN ('pending', 'invalid');

  RETURN NULL;
END;
$$;


--
-- Name: refresh_baskets_on_product_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_baskets_on_product_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Update status of all pending/invalid baskets that contain this product
  UPDATE baskets b
  SET status = 
    CASE 
      WHEN EXISTS (
        SELECT 1
        FROM basket_items bi
        JOIN products p ON p.id = bi.product_id
        WHERE bi.basket_id = b.id
          AND bi.quantity > p.available
      ) THEN 'invalid'
      ELSE 'pending'
    END
  WHERE b.status IN ('pending', 'invalid')
    AND EXISTS (
      SELECT 1 FROM basket_items bi WHERE bi.basket_id = b.id AND bi.product_id = NEW.id
    );
  RETURN NULL;
END;
$$;


--
-- Name: search_products_by_trigram(text, double precision); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_products_by_trigram(search_query text, similarity_threshold double precision DEFAULT 0.08) RETURNS TABLE(id uuid, similarity_score double precision)
    LANGUAGE sql STABLE
    AS $$
  SELECT
    p.id,
    similarity(
      -- Build one searchable text blob from all relevant fields
      coalesce(p.name, '')        || ' ' ||
      coalesce(p.description, '') || ' ' ||
      coalesce(p.keywords::text, ''),
      search_query
    ) AS similarity_score
  FROM products p
  WHERE
    p.deleted = false
    AND similarity(
      coalesce(p.name, '')        || ' ' ||
      coalesce(p.description, '') || ' ' ||
      coalesce(p.keywords::text, ''),
      search_query
    ) >= similarity_threshold
  ORDER BY similarity_score DESC;
$$;


--
-- Name: set_app_guest_session_id(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_app_guest_session_id(session_id text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  PERFORM set_config('app.guest_session_id', session_id, true);
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: basket_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.basket_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    basket_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    price_at_time integer NOT NULL,
    CONSTRAINT basket_items_price_at_time_check CHECK ((price_at_time >= 0)),
    CONSTRAINT basket_items_quantity_check CHECK ((quantity > 0))
);


--
-- Name: baskets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.baskets (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    customer_name text,
    phone text,
    state text,
    status text DEFAULT 'pending'::text NOT NULL,
    paid_at timestamp with time zone,
    shipped_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    customer_id uuid,
    guest_session_id text,
    CONSTRAINT baskets_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'shipped'::text, 'invalid'::text])))
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text,
    phone text,
    state text,
    last_basket_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    role text DEFAULT 'user'::text
);


--
-- Name: global_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_settings (
    id integer DEFAULT 1 NOT NULL,
    admin_whatsapp_number text NOT NULL,
    CONSTRAINT global_settings_id_check CHECK ((id = 1))
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid,
    product_name text NOT NULL,
    quantity integer NOT NULL,
    price_at_time integer NOT NULL,
    subtotal integer NOT NULL,
    image_url text,
    video_url text
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    original_basket_id uuid,
    customer_id uuid,
    guest_session_id text,
    customer_name text,
    phone text,
    state text,
    total integer NOT NULL,
    paid_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    delivered_at timestamp with time zone
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    price integer NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    available integer DEFAULT 0 NOT NULL,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    video_url text,
    sex text DEFAULT 'unisex'::text NOT NULL,
    keywords jsonb DEFAULT '{"sizes": [], "colors": [], "patterns": [], "materials": [], "occasions": [], "categories": []}'::jsonb,
    keywords_embedding public.vector(384),
    CONSTRAINT products_check CHECK (((available >= 0) AND (available <= stock))),
    CONSTRAINT products_price_check CHECK ((price >= 0)),
    CONSTRAINT products_stock_check CHECK ((stock >= 0)),
    CONSTRAINT sex_check CHECK ((sex = ANY (ARRAY['men'::text, 'women'::text, 'unisex'::text])))
);


--
-- Name: subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: basket_items basket_items_basket_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.basket_items
    ADD CONSTRAINT basket_items_basket_id_product_id_key UNIQUE (basket_id, product_id);


--
-- Name: basket_items basket_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.basket_items
    ADD CONSTRAINT basket_items_pkey PRIMARY KEY (id);


--
-- Name: baskets baskets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baskets
    ADD CONSTRAINT baskets_pkey PRIMARY KEY (id);


--
-- Name: customers customers_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_phone_key UNIQUE (phone);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: global_settings global_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_settings
    ADD CONSTRAINT global_settings_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: subscribers subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_email_key UNIQUE (email);


--
-- Name: subscribers subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- Name: idx_basket_items_basket_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_basket_items_basket_id ON public.basket_items USING btree (basket_id);


--
-- Name: idx_basket_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_basket_items_product_id ON public.basket_items USING btree (product_id);


--
-- Name: idx_baskets_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_baskets_customer_id ON public.baskets USING btree (customer_id);


--
-- Name: idx_baskets_guest_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_baskets_guest_session_id ON public.baskets USING btree (guest_session_id);


--
-- Name: idx_baskets_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_baskets_state ON public.baskets USING btree (state);


--
-- Name: idx_baskets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_baskets_status ON public.baskets USING btree (status);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_orders_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_customer_id ON public.orders USING btree (customer_id);


--
-- Name: idx_orders_guest_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_guest_session_id ON public.orders USING btree (guest_session_id);


--
-- Name: idx_orders_original_basket_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_original_basket_id ON public.orders USING btree (original_basket_id);


--
-- Name: idx_products_available; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_available ON public.products USING btree (available);


--
-- Name: idx_products_deleted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_deleted ON public.products USING btree (deleted);


--
-- Name: products_keywords_embedding_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_keywords_embedding_idx ON public.products USING ivfflat (keywords_embedding public.vector_cosine_ops);


--
-- Name: products_search_trgm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_search_trgm_idx ON public.products USING gin ((((((COALESCE(name, ''::text) || ' '::text) || COALESCE(description, ''::text)) || ' '::text) || COALESCE((keywords)::text, ''::text))) public.gin_trgm_ops);


--
-- Name: basket_items trigger_refresh_basket_validity; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_refresh_basket_validity AFTER INSERT OR DELETE OR UPDATE ON public.basket_items FOR EACH ROW EXECUTE FUNCTION public.refresh_basket_validity();


--
-- Name: products trigger_refresh_baskets_on_product_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_refresh_baskets_on_product_change AFTER UPDATE OF available ON public.products FOR EACH ROW EXECUTE FUNCTION public.refresh_baskets_on_product_change();


--
-- Name: basket_items basket_items_basket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.basket_items
    ADD CONSTRAINT basket_items_basket_id_fkey FOREIGN KEY (basket_id) REFERENCES public.baskets(id) ON DELETE CASCADE;


--
-- Name: basket_items basket_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.basket_items
    ADD CONSTRAINT basket_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: baskets baskets_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.baskets
    ADD CONSTRAINT baskets_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: customers fk_last_basket; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT fk_last_basket FOREIGN KEY (last_basket_id) REFERENCES public.baskets(id) ON DELETE SET NULL;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: orders orders_original_basket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_original_basket_id_fkey FOREIGN KEY (original_basket_id) REFERENCES public.baskets(id) ON DELETE SET NULL;


--
-- Name: products Admin can insert products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can insert products" ON public.products FOR INSERT WITH CHECK (( SELECT public.is_admin() AS is_admin));


--
-- Name: baskets Admin can update any basket; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can update any basket" ON public.baskets FOR UPDATE USING (( SELECT public.is_admin() AS is_admin)) WITH CHECK (( SELECT public.is_admin() AS is_admin));


--
-- Name: baskets Admin can update any basket status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can update any basket status" ON public.baskets FOR UPDATE USING ((( SELECT public.is_admin() AS is_admin) AND (customer_id <> ( SELECT auth.uid() AS uid)))) WITH CHECK ((( SELECT public.is_admin() AS is_admin) AND (customer_id <> ( SELECT auth.uid() AS uid))));


--
-- Name: orders Admin can update any order; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can update any order" ON public.orders FOR SELECT USING (( SELECT public.is_admin() AS is_admin));


--
-- Name: orders Admin can update orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can update orders" ON public.orders FOR UPDATE USING (( SELECT public.is_admin() AS is_admin)) WITH CHECK (( SELECT public.is_admin() AS is_admin));


--
-- Name: baskets Admin can update own basket fully; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can update own basket fully" ON public.baskets FOR UPDATE USING ((( SELECT public.is_admin() AS is_admin) AND (customer_id = ( SELECT auth.uid() AS uid)))) WITH CHECK ((( SELECT public.is_admin() AS is_admin) AND (customer_id = ( SELECT auth.uid() AS uid))));


--
-- Name: products Admin can update products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can update products" ON public.products FOR UPDATE USING (( SELECT public.is_admin() AS is_admin)) WITH CHECK (( SELECT public.is_admin() AS is_admin));


--
-- Name: baskets Admin can view any basket; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view any basket" ON public.baskets FOR SELECT USING (( SELECT public.is_admin() AS is_admin));


--
-- Name: basket_items Admin can view any basket items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view any basket items" ON public.basket_items FOR SELECT USING (( SELECT public.is_admin() AS is_admin));


--
-- Name: global_settings Admins can update global_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update global_settings" ON public.global_settings FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.customers
  WHERE ((customers.id = auth.uid()) AND (customers.role = 'admin'::text)))));


--
-- Name: subscribers Anyone can subscribe; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT WITH CHECK (true);


--
-- Name: global_settings Anyone can view global_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view global_settings" ON public.global_settings FOR SELECT USING (true);


--
-- Name: products Anyone can view products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view products" ON public.products FOR SELECT TO authenticated, anon USING (true);


--
-- Name: baskets Delete own baskets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Delete own baskets" ON public.baskets FOR DELETE USING (((( SELECT auth.uid() AS uid) = customer_id) OR ((( SELECT auth.uid() AS uid) IS NULL) AND (guest_session_id = ( SELECT public.get_guest_session_id() AS get_guest_session_id)) AND (( SELECT public.get_guest_session_id() AS get_guest_session_id) <> ''::text))));


--
-- Name: baskets Insert baskets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Insert baskets" ON public.baskets FOR INSERT WITH CHECK ((((auth.uid() IS NOT NULL) AND (customer_id = auth.uid())) OR ((auth.uid() IS NULL) AND (guest_session_id = ( SELECT public.get_guest_session_id() AS get_guest_session_id)) AND (( SELECT public.get_guest_session_id() AS get_guest_session_id) <> ''::text))));


--
-- Name: subscribers Only admins can view subscribers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can view subscribers" ON public.subscribers FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.customers
  WHERE ((customers.id = auth.uid()) AND (customers.role = 'admin'::text)))));


--
-- Name: baskets Select own baskets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Select own baskets" ON public.baskets FOR SELECT USING (((( SELECT auth.uid() AS uid) = customer_id) OR ((( SELECT auth.uid() AS uid) IS NULL) AND (guest_session_id = ( SELECT public.get_guest_session_id() AS get_guest_session_id)) AND (( SELECT public.get_guest_session_id() AS get_guest_session_id) <> ''::text)) OR (((customer_id)::text = ( SELECT public.get_guest_session_id() AS get_guest_session_id)) AND (( SELECT public.get_guest_session_id() AS get_guest_session_id) <> ''::text))));


--
-- Name: baskets Update own baskets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Update own baskets" ON public.baskets FOR UPDATE USING (((( SELECT auth.uid() AS uid) = customer_id) OR ((( SELECT auth.uid() AS uid) IS NULL) AND (guest_session_id = ( SELECT public.get_guest_session_id() AS get_guest_session_id)) AND (( SELECT public.get_guest_session_id() AS get_guest_session_id) <> ''::text)))) WITH CHECK (((( SELECT auth.uid() AS uid) = customer_id) OR ((( SELECT auth.uid() AS uid) IS NULL) AND (guest_session_id = ( SELECT public.get_guest_session_id() AS get_guest_session_id)) AND (( SELECT public.get_guest_session_id() AS get_guest_session_id) <> ''::text))));


--
-- Name: customers Users can insert their own customer record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own customer record" ON public.customers FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: customers Users can update own customer record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own customer record" ON public.customers FOR UPDATE TO authenticated USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: customers Users can view own customer record; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own customer record" ON public.customers FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: order_items View items in own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View items in own orders" ON public.order_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND ((( SELECT auth.uid() AS uid) = orders.customer_id) OR ((( SELECT auth.uid() AS uid) IS NULL) AND (EXISTS ( SELECT 1
           FROM public.baskets
          WHERE ((baskets.id = orders.original_basket_id) AND (baskets.guest_session_id = ( SELECT public.get_guest_session_id() AS get_guest_session_id)) AND (( SELECT public.get_guest_session_id() AS get_guest_session_id) <> ''::text))))))))));


--
-- Name: orders View own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View own orders" ON public.orders FOR SELECT USING (((( SELECT auth.uid() AS uid) = customer_id) OR ((( SELECT auth.uid() AS uid) IS NULL) AND (EXISTS ( SELECT 1
   FROM public.baskets
  WHERE ((baskets.id = orders.original_basket_id) AND (baskets.guest_session_id = ( SELECT public.get_guest_session_id() AS get_guest_session_id)) AND (( SELECT public.get_guest_session_id() AS get_guest_session_id) <> ''::text)))))));


--
-- Name: basket_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.basket_items ENABLE ROW LEVEL SECURITY;

--
-- Name: basket_items basket_items_manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY basket_items_manage ON public.basket_items USING ((EXISTS ( SELECT 1
   FROM public.baskets
  WHERE ((baskets.id = basket_items.basket_id) AND (((auth.uid() IS NOT NULL) AND (baskets.customer_id = auth.uid())) OR ((auth.uid() IS NULL) AND (baskets.guest_session_id = ( SELECT public.get_guest_session_id() AS get_guest_session_id)) AND (( SELECT public.get_guest_session_id() AS get_guest_session_id) <> ''::text)) OR (((baskets.customer_id)::text = ( SELECT public.get_guest_session_id() AS get_guest_session_id)) AND (( SELECT public.get_guest_session_id() AS get_guest_session_id) <> ''::text))))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.baskets
  WHERE ((baskets.id = basket_items.basket_id) AND (((auth.uid() IS NOT NULL) AND (baskets.customer_id = auth.uid())) OR ((auth.uid() IS NULL) AND (baskets.guest_session_id = ( SELECT public.get_guest_session_id() AS get_guest_session_id)) AND (( SELECT public.get_guest_session_id() AS get_guest_session_id) <> ''::text)) OR (((baskets.customer_id)::text = ( SELECT public.get_guest_session_id() AS get_guest_session_id)) AND (( SELECT public.get_guest_session_id() AS get_guest_session_id) <> ''::text)))))));


--
-- Name: baskets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.baskets ENABLE ROW LEVEL SECURITY;

--
-- Name: customers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

--
-- Name: global_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: subscribers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict J02h5zKWZ6Ajy2mxG5hu2yo3f5Dj61cJuNtF4Ch63danLptObXEg5VjSgaWmnYH


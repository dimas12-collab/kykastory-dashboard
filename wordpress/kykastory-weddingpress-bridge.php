<?php
/**
 * Plugin Name: Kykastory WeddingPress Bridge
 * Description: Mengirim entry Guestbook WeddingPress ke project Kykastory yang sesuai.
 * Version: 1.2.0
 * Author: Kykastory
 */
if ( ! defined( 'ABSPATH' ) ) exit;

final class Kykastory_WeddingPress_Bridge {
    const OPTION = 'kykastory_weddingpress_bridge_options';

    public function __construct() {
        add_action( 'admin_menu', [ $this, 'add_settings_page' ] );
        add_action( 'admin_init', [ $this, 'register_settings' ] );
        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
        // WeddingPress runs its own handler at priority 5 and calls wp_die().
        add_action( 'wp_ajax_guestbook_box_submit', [ $this, 'forward_guestbook' ], 4 );
        add_action( 'wp_ajax_nopriv_guestbook_box_submit', [ $this, 'forward_guestbook' ], 4 );
    }

    public function register_rest_routes() {
        register_rest_route( 'kykastory/v1', '/rsvp', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [ $this, 'get_guestbook_entries' ],
            'permission_callback' => [ $this, 'authorize_rest_request' ],
            'args' => [ 'post_id' => [ 'required' => true, 'sanitize_callback' => 'absint' ], 'form_id' => [ 'required' => false, 'sanitize_callback' => 'sanitize_text_field' ] ],
        ] );
    }

    public function authorize_rest_request( $request ) {
        $o = $this->options();
        $secret = $request->get_header( 'x-weddingpress-secret' );
        return ! empty( $o['secret'] ) && is_string( $secret ) && hash_equals( $o['secret'], $secret );
    }

    public function get_guestbook_entries( $request ) {
        global $wpdb;
        $post_id = absint( $request->get_param( 'post_id' ) );
        $form_id = sanitize_text_field( $request->get_param( 'form_id' ) );
        $table = $wpdb->prefix . 'wdp_guestbooks';
        $sql = "SELECT id, post_id, form_id, name, message, confirm, created_at FROM {$table} WHERE post_id = %d";
        $params = [ $post_id ];
        if ( $form_id ) { $sql .= ' AND form_id = %s'; $params[] = $form_id; }
        $sql .= ' ORDER BY created_at DESC';
        $rows = $wpdb->get_results( $wpdb->prepare( $sql, $params ) );
        $rsvps = array_map( function( $row ) {
            return [
                'externalId' => (int) $row->id,
                'postId' => (int) $row->post_id,
                'formId' => (string) $row->form_id,
                'name' => (string) $row->name,
                'message' => (string) $row->message,
                'status' => (string) $row->confirm,
                'guestCount' => 1,
                'submittedAt' => wp_date( DATE_ATOM, strtotime( $row->created_at ) ),
            ];
        }, $rows ?: [] );
        return rest_ensure_response( [ 'source' => 'WeddingPress', 'rsvps' => $rsvps, 'count' => count( $rsvps ) ] );
    }

    private function options() {
        return wp_parse_args( get_option( self::OPTION, [] ), [
            'enabled' => 0, 'base_url' => '', 'endpoint' => '', 'project_id' => 'demo-project',
            'secret' => '', 'form_id' => 'budiriri', 'mappings' => "277|demo-project|budiriri",
        ] );
    }

    public function register_settings() {
        register_setting( 'kykastory_bridge', self::OPTION, [ 'sanitize_callback' => function ( $input ) {
            return [
                'enabled' => empty( $input['enabled'] ) ? 0 : 1,
                'base_url' => esc_url_raw( trim( $input['base_url'] ?? '' ) ),
                'endpoint' => esc_url_raw( trim( $input['endpoint'] ?? '' ) ),
                'project_id' => sanitize_text_field( $input['project_id'] ?? '' ),
                'secret' => sanitize_text_field( $input['secret'] ?? '' ),
                'form_id' => sanitize_text_field( $input['form_id'] ?? '' ),
                'mappings' => sanitize_textarea_field( $input['mappings'] ?? '' ),
            ];
        } ] );
    }

    public function add_settings_page() { add_options_page( 'Kykastory Bridge', 'Kykastory Bridge', 'manage_options', 'kykastory-bridge', [ $this, 'render_settings_page' ] ); }

    public function render_settings_page() {
        if ( ! current_user_can( 'manage_options' ) ) return;
        $o = $this->options();
        ?>
        <div class="wrap"><h1>Kykastory WeddingPress Bridge</h1>
        <p>Gunakan mapping agar satu WordPress dapat menangani beberapa undangan.</p>
        <form method="post" action="options.php">
        <?php settings_fields( 'kykastory_bridge' ); ?><table class="form-table" role="presentation">
        <tr><th>Aktifkan bridge</th><td><label><input type="checkbox" name="<?php echo esc_attr(self::OPTION); ?>[enabled]" value="1" <?php checked($o['enabled'],1); ?>> Kirim entry baru</label></td></tr>
        <tr><th><label for="kykastory-base-url">Base URL Kykastory</label></th><td><input id="kykastory-base-url" class="regular-text" type="url" name="<?php echo esc_attr(self::OPTION); ?>[base_url]" value="<?php echo esc_attr($o['base_url']); ?>" placeholder="https://id.kykastory.com"><p class="description">Base URL aplikasi, tanpa path API.</p></td></tr>
        <tr><th><label for="kykastory-secret">Webhook secret</label></th><td><input id="kykastory-secret" class="regular-text" type="password" name="<?php echo esc_attr(self::OPTION); ?>[secret]" value="<?php echo esc_attr($o['secret']); ?>" autocomplete="new-password"><p class="description">Sama dengan WEDDINGPRESS_WEBHOOK_SECRET di Coolify.</p></td></tr>
        <tr><th><label for="kykastory-mappings">Mapping undangan</label></th><td><textarea id="kykastory-mappings" class="large-text code" rows="7" name="<?php echo esc_attr(self::OPTION); ?>[mappings]" placeholder="277|project-chika|budiriri"><?php echo esc_textarea($o['mappings']); ?></textarea><p class="description"><code>post_id|project_id|form_id</code> satu mapping per baris. Post ID menjadi penentu utama. Form ID boleh dikosongkan.</p></td></tr>
        <tr><th>Fallback project</th><td><input class="regular-text" type="text" name="<?php echo esc_attr(self::OPTION); ?>[project_id]" value="<?php echo esc_attr($o['project_id']); ?>"><p class="description">Dipakai jika Post ID tidak ada di mapping.</p></td></tr>
        <tr><th>Fallback Form ID</th><td><input class="regular-text" type="text" name="<?php echo esc_attr(self::OPTION); ?>[form_id]" value="<?php echo esc_attr($o['form_id']); ?>"></td></tr>
        </table><?php submit_button('Simpan pengaturan'); ?></form>
        <hr><h2>Contoh</h2><pre><code>277|project-chika|budiriri
302|project-rara|form-rara</code></pre></div>
        <?php
    }

    private function mapping_for( $post_id, $form_id ) {
        $o = $this->options();
        $form_match = null;
        foreach ( preg_split('/\r?\n/', $o['mappings']) as $line ) {
            $parts = array_map('trim', explode('|', $line));
            if ( count($parts) < 2 || ! $parts[0] || ! $parts[1] ) continue;
            if ( (int)$parts[0] === (int)$post_id && ( empty($parts[2]) || $parts[2] === $form_id ) ) return [ $parts[1], $parts[2] ?? '' ];
            if ( $form_id && ! empty($parts[2]) && $parts[2] === $form_id ) $form_match = [ $parts[1], $parts[2] ];
        }
        if ( $form_match ) return $form_match;
        return [ $o['project_id'], $o['form_id'] ];
    }

    public function forward_guestbook() {
        $o = $this->options();
        if ( empty($o['enabled']) || empty($o['secret']) ) return;
        if ( ! check_ajax_referer('wdp_guestbook_action', 'nonce', false) ) return;
        $form_id = sanitize_text_field(wp_unslash($_POST['id'] ?? ''));
        $post_id = absint($_POST['post_id'] ?? 0);
        [ $project_id, $mapped_form ] = $this->mapping_for($post_id, $form_id);
        if ( $mapped_form && $mapped_form !== $form_id ) return;
        $name = sanitize_text_field(wp_unslash($_POST['guestbook-name'] ?? ''));
        $message = sanitize_textarea_field(wp_unslash($_POST['guestbook-message'] ?? ''));
        $confirm = sanitize_text_field(wp_unslash($_POST['confirm'] ?? ''));
        if ( ! $name || ! $message || ! $project_id ) return;
        $base = trim($o['base_url']);
        if ( ! $base && ! empty($o['endpoint']) ) $base = preg_replace('#/api/projects/[^/]+/rsvp/sync/?$#', '', trim($o['endpoint']));
        if ( ! $base ) return;
        $endpoint = rtrim($base, '/') . '/api/projects/' . rawurlencode($project_id) . '/rsvp/sync';
        wp_remote_post($endpoint, [
            'timeout' => 5, 'blocking' => false,
            'headers' => [ 'Content-Type' => 'application/json', 'x-weddingpress-secret' => $o['secret'] ],
            'body' => wp_json_encode([ 'source' => 'WeddingPress', 'rsvps' => [[ 'name' => $name, 'status' => $confirm, 'guestCount' => 1, 'message' => $message, 'postId' => $post_id, 'formId' => $form_id ]] ]),
        ]);
    }
}
new Kykastory_WeddingPress_Bridge();

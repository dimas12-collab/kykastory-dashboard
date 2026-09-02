<?php
/**
 * Plugin Name: Kykastory WeddingPress Bridge
 * Description: Mengirim entry Guestbook WeddingPress ke dashboard Kykastory.
 * Version: 1.0.0
 * Author: Kykastory
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Kykastory_WeddingPress_Bridge {
	const OPTION = 'kykastory_weddingpress_bridge_options';

	public function __construct() {
		add_action( 'admin_menu', [ $this, 'add_settings_page' ] );
		add_action( 'admin_init', [ $this, 'register_settings' ] );
		// Priority 4: WeddingPress's own handler runs at priority 5 and calls wp_die().
		add_action( 'wp_ajax_guestbook_box_submit', [ $this, 'forward_guestbook' ], 4 );
		add_action( 'wp_ajax_nopriv_guestbook_box_submit', [ $this, 'forward_guestbook' ], 4 );
	}

	private function options() {
		$defaults = [
			'enabled'    => 0,
			'endpoint'   => '',
			'project_id' => 'demo-project',
			'secret'     => '',
			'form_id'    => 'budiriri',
		];
		return wp_parse_args( get_option( self::OPTION, [] ), $defaults );
	}

	public function register_settings() {
		register_setting( 'kykastory_bridge', self::OPTION, [
			'sanitize_callback' => function ( $input ) {
				return [
					'enabled'    => empty( $input['enabled'] ) ? 0 : 1,
					'endpoint'   => esc_url_raw( trim( $input['endpoint'] ?? '' ) ),
					'project_id' => sanitize_text_field( $input['project_id'] ?? '' ),
					'secret'     => sanitize_text_field( $input['secret'] ?? '' ),
					'form_id'    => sanitize_text_field( $input['form_id'] ?? '' ),
				];
			},
		] );
	}

	public function add_settings_page() {
		add_options_page( 'Kykastory Bridge', 'Kykastory Bridge', 'manage_options', 'kykastory-bridge', [ $this, 'render_settings_page' ] );
	}

	public function render_settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$options = $this->options();
		?>
		<div class="wrap">
			<h1>Kykastory WeddingPress Bridge</h1>
			<p>Bridge ini menangkap Guestbook WeddingPress dan mengirim entry RSVP ke dashboard Kykastory.</p>
			<form method="post" action="options.php">
				<?php settings_fields( 'kykastory_bridge' ); ?>
				<table class="form-table" role="presentation">
					<tr><th scope="row">Aktifkan bridge</th><td><label><input type="checkbox" name="<?php echo esc_attr( self::OPTION ); ?>[enabled]" value="1" <?php checked( $options['enabled'], 1 ); ?>> Kirim entry baru ke Kykastory</label></td></tr>
					<tr><th scope="row"><label for="kykastory-endpoint">Endpoint Kykastory</label></th><td><input id="kykastory-endpoint" class="regular-text" type="url" name="<?php echo esc_attr( self::OPTION ); ?>[endpoint]" value="<?php echo esc_attr( $options['endpoint'] ); ?>" placeholder="https://id.kykastory.com/api/projects/demo-project/rsvp/sync"><p class="description">Gunakan URL production Kykastory.</p></td></tr>
					<tr><th scope="row"><label for="kykastory-project">Project ID</label></th><td><input id="kykastory-project" class="regular-text" type="text" name="<?php echo esc_attr( self::OPTION ); ?>[project_id]" value="<?php echo esc_attr( $options['project_id'] ); ?>"><p class="description">Contoh: demo-project.</p></td></tr>
					<tr><th scope="row"><label for="kykastory-secret">Webhook secret</label></th><td><input id="kykastory-secret" class="regular-text" type="password" name="<?php echo esc_attr( self::OPTION ); ?>[secret]" value="<?php echo esc_attr( $options['secret'] ); ?>" autocomplete="new-password"><p class="description">Harus sama dengan WEDDINGPRESS_WEBHOOK_SECRET di Coolify.</p></td></tr>
					<tr><th scope="row"><label for="kykastory-form-id">Form ID</label></th><td><input id="kykastory-form-id" class="regular-text" type="text" name="<?php echo esc_attr( self::OPTION ); ?>[form_id]" value="<?php echo esc_attr( $options['form_id'] ); ?>"><p class="description">Dari screenshot Anda: budiriri.</p></td></tr>
				</table>
				<?php submit_button( 'Simpan pengaturan' ); ?>
			</form>
			<hr>
			<h2>Format yang dikirim</h2>
			<pre><code>{"source":"WeddingPress","rsvps":[{"name":"Nama","status":"Hadir","guestCount":1,"message":"Ucapan"}]}</code></pre>
		</div>
		<?php
	}

	public function forward_guestbook() {
		$options = $this->options();
		if ( empty( $options['enabled'] ) || empty( $options['endpoint'] ) || empty( $options['secret'] ) ) {
			return;
		}
		// Validate the same nonce used by WeddingPress before forwarding public AJAX input.
		if ( ! check_ajax_referer( 'wdp_guestbook_action', 'nonce', false ) ) {
			return;
		}
		$form_id = sanitize_text_field( wp_unslash( $_POST['id'] ?? '' ) );
		if ( $options['form_id'] && $form_id !== $options['form_id'] ) {
			return;
		}
		$name    = sanitize_text_field( wp_unslash( $_POST['guestbook-name'] ?? '' ) );
		$message = sanitize_textarea_field( wp_unslash( $_POST['guestbook-message'] ?? '' ) );
		$confirm = sanitize_text_field( wp_unslash( $_POST['confirm'] ?? '' ) );
		$post_id = absint( $_POST['post_id'] ?? 0 );
		if ( ! $name || ! $message ) {
			return;
		}
		$payload = [
			'source' => 'WeddingPress',
			'rsvps'  => [[
				'name'       => $name,
				'status'     => $confirm,
				'guestCount' => 1,
				'message'    => $message,
				'postId'     => $post_id,
				'formId'     => $form_id,
			]],
		];
		wp_remote_post( $options['endpoint'], [
			'timeout'  => 5,
			'blocking' => false,
			'headers'  => [
				'Content-Type'           => 'application/json',
				'x-weddingpress-secret' => $options['secret'],
			],
			'body'    => wp_json_encode( $payload ),
		] );
	}
}

new Kykastory_WeddingPress_Bridge();

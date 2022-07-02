#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
  let context = tauri::generate_context!();
  tauri::Builder::default()
    .setup(|app| {
      use tauri::Manager;
      use window_shadows::set_shadow;
      let window = app.get_window("main").unwrap();
      let _ = set_shadow(&window, true); // Don't use unwrap() here as it will panic on Linux.
      Ok(())
    })
    .menu(tauri::Menu::os_default(&context.package_info().name))
    .run(context)
    .expect("error while running tauri application");
}

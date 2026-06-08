"""
========================================================
  THE PERFECT GUESS - A Modern Number Guessing Game
  Built with Python & Tkinter
  Features: Difficulty levels, scoring, timer, sound,
            progress bar, high score persistence,
            statistics, animations, and more.
========================================================
"""

import tkinter as tk
from tkinter import ttk, messagebox, font as tkfont
import random
import time
import os
import threading
import sys

# ──────────────────────────────────────────────
#  Optional sound support
# ──────────────────────────────────────────────
try:
    import winsound
    SOUND_AVAILABLE = True
    PLATFORM = "windows"
except ImportError:
    SOUND_AVAILABLE = False
    PLATFORM = "other"

# ──────────────────────────────────────────────
#  Constants – Colors & Fonts
# ──────────────────────────────────────────────
BG_DARK        = "#1E1E1E"
BG_CARD        = "#252526"
BG_CARD2       = "#2D2D30"
ACCENT         = "#00D4FF"
ACCENT_HOVER   = "#00A8CC"
SUCCESS        = "#4EC94E"
SUCCESS_HOVER  = "#3BA83B"
WARNING        = "#FF8C00"
DANGER         = "#FF4444"
TEXT_PRIMARY   = "#FFFFFF"
TEXT_SECONDARY = "#ABABAB"
TEXT_MUTED     = "#6B6B6B"
BTN_NEUTRAL    = "#3E3E42"
BTN_NEUTRAL_H  = "#505055"
PROGRESS_BG    = "#333337"
PROGRESS_FG    = "#00D4FF"

HIGH_SCORE_FILE = "highscore.txt"

DIFFICULTIES = {
    "Easy":   {"range": 50,  "color": SUCCESS,  "hover": SUCCESS_HOVER,  "emoji": "🟢"},
    "Medium": {"range": 100, "color": ACCENT,   "hover": ACCENT_HOVER,   "emoji": "🔵"},
    "Hard":   {"range": 500, "color": WARNING,  "hover": "#CC7000",      "emoji": "🟠"},
}


# ══════════════════════════════════════════════
#  Sound helpers
# ══════════════════════════════════════════════
def play_sound(sound_type: str) -> None:
    """
    Play a sound for the given event type.
    Falls back to system beep when winsound is unavailable.
    """
    def _play():
        try:
            if PLATFORM == "windows":
                if sound_type == "correct":
                    # Rising arpeggio
                    for freq in [523, 659, 784, 1047]:
                        winsound.Beep(freq, 120)
                elif sound_type == "wrong":
                    winsound.Beep(300, 150)
                elif sound_type == "highscore":
                    for freq in [784, 1047, 1319, 1568]:
                        winsound.Beep(freq, 150)
                elif sound_type == "click":
                    winsound.Beep(600, 60)
            else:
                # Generic beep via terminal bell
                sys.stdout.write("\a")
                sys.stdout.flush()
        except Exception:
            pass  # Silently swallow any audio errors

    threading.Thread(target=_play, daemon=True).start()


# ══════════════════════════════════════════════
#  File helpers
# ══════════════════════════════════════════════
def read_high_score() -> int:
    """Read the persisted high score from file; return 0 if not found."""
    try:
        if os.path.exists(HIGH_SCORE_FILE):
            with open(HIGH_SCORE_FILE, "r") as f:
                return int(f.read().strip())
    except (ValueError, IOError):
        pass
    return 0


def write_high_score(score: int) -> None:
    """Persist the new high score to file."""
    try:
        with open(HIGH_SCORE_FILE, "w") as f:
            f.write(str(score))
    except IOError:
        pass  # Non-critical; ignore write failures


# ══════════════════════════════════════════════
#  Main Application Class
# ══════════════════════════════════════════════
class Game(tk.Tk):
    """
    The Perfect Guess – main application window.
    Encapsulates all UI, game logic, timer, scoring,
    and file I/O.
    """

    # ── Initialisation ──────────────────────────
    def __init__(self):
        super().__init__()

        # ── Window setup ──
        self.title("The Perfect Guess")
        self.geometry("700x580")
        self.resizable(False, False)
        self.configure(bg=BG_DARK)
        self._center_window(700, 580)

        # ── Game state ──
        self.difficulty      = "Medium"
        self.max_range       = DIFFICULTIES[self.difficulty]["range"]
        self.secret_number   = 0
        self.attempts        = 0
        self.current_score   = 0
        self.best_score      = read_high_score()
        self.games_played    = 0
        self.games_won       = 0
        self.game_active     = False

        # ── Timer state ──
        self.start_time      = 0
        self.elapsed_seconds = 0
        self._timer_id       = None   # after() handle

        # ── StringVar / IntVar wrappers ──
        self.guess_var        = tk.StringVar()
        self.feedback_var     = tk.StringVar(value="Select a difficulty and press 'New Game' to start!")
        self.attempts_var     = tk.StringVar(value="0")
        self.best_score_var   = tk.StringVar(value=str(self.best_score))
        self.diff_var         = tk.StringVar(value=self.difficulty)
        self.timer_var        = tk.StringVar(value="Time Elapsed: 00:00")
        self.stats_played_var = tk.IntVar(value=0)
        self.stats_won_var    = tk.IntVar(value=0)
        self.progress_val     = tk.DoubleVar(value=0.0)

        # ── Build UI ──
        self._build_fonts()
        self._build_ui()
        self._apply_ttk_styles()

        # ── Key bindings ──
        self.bind("<Return>",  lambda e: self._submit_guess())
        self.bind("<Escape>",  lambda e: self._exit_game())
        self.bind("<F2>",      lambda e: self._new_game())

        # Start in idle state
        self._new_game()

    # ── Window helpers ────────────────────────────
    def _center_window(self, w: int, h: int) -> None:
        """Center the window on the screen."""
        sw = self.winfo_screenwidth()
        sh = self.winfo_screenheight()
        x  = (sw - w) // 2
        y  = (sh - h) // 2
        self.geometry(f"{w}x{h}+{x}+{y}")

    def _build_fonts(self) -> None:
        """Pre-create named Font objects for reuse."""
        self.f_title    = tkfont.Font(family="Segoe UI", size=22, weight="bold")
        self.f_subtitle = tkfont.Font(family="Segoe UI", size=10)
        self.f_label    = tkfont.Font(family="Segoe UI", size=10, weight="bold")
        self.f_value    = tkfont.Font(family="Segoe UI", size=14, weight="bold")
        self.f_entry    = tkfont.Font(family="Segoe UI", size=16)
        self.f_btn      = tkfont.Font(family="Segoe UI", size=10, weight="bold")
        self.f_feedback = tkfont.Font(family="Segoe UI", size=12, weight="bold")
        self.f_stats    = tkfont.Font(family="Segoe UI", size=9)
        self.f_timer    = tkfont.Font(family="Consolas",  size=10, weight="bold")

    # ════════════════════════════════════════════
    #  UI CONSTRUCTION
    # ════════════════════════════════════════════
    def _build_ui(self) -> None:
        """Assemble all UI sections."""
        self._build_header()
        self._build_info_bar()
        self._build_difficulty_section()
        self._build_input_section()
        self._build_feedback_section()
        self._build_progress_section()
        self._build_action_buttons()
        self._build_stats_bar()

    # ── Header ────────────────────────────────────
    def _build_header(self) -> None:
        """Large title + subtitle banner."""
        header = tk.Frame(self, bg="#141414", pady=12)
        header.pack(fill="x")

        tk.Label(
            header, text="🎯  The Perfect Guess",
            font=self.f_title, fg=ACCENT, bg="#141414"
        ).pack()

        tk.Label(
            header, text="Can you guess the secret number?",
            font=self.f_subtitle, fg=TEXT_SECONDARY, bg="#141414"
        ).pack()

        # Accent underline
        tk.Frame(header, height=2, bg=ACCENT).pack(fill="x", padx=40, pady=(8, 0))

    # ── Info bar (attempts / best / difficulty / timer) ──
    def _build_info_bar(self) -> None:
        """Compact info strip below the header."""
        bar = tk.Frame(self, bg=BG_CARD2, pady=8)
        bar.pack(fill="x", padx=20, pady=(10, 0))

        cards = [
            ("🎮 Attempts",  self.attempts_var,   "attempts_lbl"),
            ("🏆 Best Score", self.best_score_var, "best_lbl"),
            ("⚡ Difficulty", self.diff_var,        "diff_lbl"),
        ]

        for col_idx, (label_txt, var, _attr) in enumerate(cards):
            frame = tk.Frame(bar, bg=BG_CARD2)
            frame.grid(row=0, column=col_idx, padx=20, sticky="w")

            tk.Label(frame, text=label_txt, font=self.f_stats,
                     fg=TEXT_MUTED, bg=BG_CARD2).pack(anchor="w")
            tk.Label(frame, textvariable=var, font=self.f_value,
                     fg=TEXT_PRIMARY, bg=BG_CARD2).pack(anchor="w")

        # Timer – right-aligned
        timer_frame = tk.Frame(bar, bg=BG_CARD2)
        timer_frame.grid(row=0, column=3, padx=20, sticky="e")
        bar.grid_columnconfigure(3, weight=1)

        tk.Label(timer_frame, text="⏱ Timer", font=self.f_stats,
                 fg=TEXT_MUTED, bg=BG_CARD2).pack(anchor="e")
        tk.Label(timer_frame, textvariable=self.timer_var,
                 font=self.f_timer, fg=ACCENT, bg=BG_CARD2).pack(anchor="e")

    # ── Difficulty buttons ────────────────────────
    def _build_difficulty_section(self) -> None:
        """Three difficulty radio-style buttons."""
        container = tk.Frame(self, bg=BG_DARK, pady=6)
        container.pack(fill="x", padx=20)

        tk.Label(container, text="SELECT DIFFICULTY",
                 font=self.f_stats, fg=TEXT_MUTED, bg=BG_DARK).pack(anchor="w")

        btn_row = tk.Frame(container, bg=BG_DARK)
        btn_row.pack(fill="x", pady=(4, 0))

        self._diff_buttons = {}
        for diff_name, cfg in DIFFICULTIES.items():
            btn = tk.Button(
                btn_row,
                text=f"{cfg['emoji']}  {diff_name}  (1–{cfg['range']})",
                font=self.f_btn,
                fg=TEXT_PRIMARY,
                bg=BTN_NEUTRAL,
                activebackground=cfg["color"],
                activeforeground=TEXT_PRIMARY,
                bd=0, padx=14, pady=7,
                cursor="hand2",
                command=lambda d=diff_name: self._select_difficulty(d),
            )
            btn.pack(side="left", padx=(0, 8))
            self._diff_buttons[diff_name] = btn
            self._add_hover(btn, BTN_NEUTRAL, BTN_NEUTRAL_H)

        self._highlight_diff_button(self.difficulty)

    # ── Guess input ───────────────────────────────
    def _build_input_section(self) -> None:
        """Label + entry field for the guess."""
        container = tk.Frame(self, bg=BG_DARK, pady=6)
        container.pack(fill="x", padx=20)

        tk.Label(container, text="ENTER YOUR GUESS",
                 font=self.f_stats, fg=TEXT_MUTED, bg=BG_DARK).pack(anchor="w")

        input_row = tk.Frame(container, bg=BG_DARK)
        input_row.pack(fill="x", pady=(4, 0))

        # Validate: only allow integer characters
        vcmd = (self.register(self._validate_integer), "%P")

        self.entry = tk.Entry(
            input_row,
            textvariable=self.guess_var,
            font=self.f_entry,
            fg=TEXT_PRIMARY,
            bg=BG_CARD,
            insertbackground=ACCENT,
            bd=0,
            width=14,
            validate="key",
            validatecommand=vcmd,
            justify="center",
        )
        self.entry.pack(side="left", ipady=10, padx=(0, 10))
        self.entry.focus_set()

        # Range hint
        self.range_label = tk.Label(
            input_row,
            text=f"Range: 1 – {self.max_range}",
            font=self.f_stats,
            fg=TEXT_MUTED,
            bg=BG_DARK,
        )
        self.range_label.pack(side="left")

    # ── Feedback area ─────────────────────────────
    def _build_feedback_section(self) -> None:
        """Coloured message area for hints and results."""
        container = tk.Frame(self, bg=BG_CARD, pady=12, padx=16)
        container.pack(fill="x", padx=20, pady=(6, 0))

        self.feedback_label = tk.Label(
            container,
            textvariable=self.feedback_var,
            font=self.f_feedback,
            fg=ACCENT,
            bg=BG_CARD,
            wraplength=640,
            justify="center",
        )
        self.feedback_label.pack()

    # ── Progress bar ──────────────────────────────
    def _build_progress_section(self) -> None:
        """
        Custom canvas-based progress bar showing estimated
        closeness to the target.
        """
        container = tk.Frame(self, bg=BG_DARK, pady=6)
        container.pack(fill="x", padx=20)

        header_row = tk.Frame(container, bg=BG_DARK)
        header_row.pack(fill="x")

        tk.Label(header_row, text="CLOSENESS TO TARGET",
                 font=self.f_stats, fg=TEXT_MUTED, bg=BG_DARK).pack(side="left")

        self.progress_pct_label = tk.Label(
            header_row, text="0%",
            font=self.f_stats, fg=ACCENT, bg=BG_DARK
        )
        self.progress_pct_label.pack(side="right")

        # Canvas bar
        self.progress_canvas = tk.Canvas(
            container, height=12, bg=PROGRESS_BG,
            bd=0, highlightthickness=0
        )
        self.progress_canvas.pack(fill="x", pady=(4, 0))
        self.progress_bar_rect = self.progress_canvas.create_rectangle(
            0, 0, 0, 12, fill=PROGRESS_FG, outline=""
        )
        self.progress_canvas.bind("<Configure>", self._redraw_progress)

    # ── Action buttons ────────────────────────────
    def _build_action_buttons(self) -> None:
        """Submit Guess / New Game / Reset High Score / Exit."""
        container = tk.Frame(self, bg=BG_DARK, pady=8)
        container.pack(fill="x", padx=20)

        btn_specs = [
            ("🚀  Submit Guess",    SUCCESS,    SUCCESS_HOVER,  self._submit_guess),
            ("🎲  New Game",        ACCENT,     ACCENT_HOVER,   self._new_game),
            ("🔄  Reset High Score",BTN_NEUTRAL, BTN_NEUTRAL_H, self._reset_high_score),
            ("❌  Exit",            DANGER,     "#CC0000",      self._exit_game),
        ]

        for text, bg, hover_bg, cmd in btn_specs:
            btn = tk.Button(
                container,
                text=text,
                font=self.f_btn,
                fg=TEXT_PRIMARY,
                bg=bg,
                activebackground=hover_bg,
                activeforeground=TEXT_PRIMARY,
                bd=0, padx=14, pady=8,
                cursor="hand2",
                command=cmd,
            )
            btn.pack(side="left", padx=(0, 8))
            self._add_hover(btn, bg, hover_bg)

    # ── Stats footer bar ──────────────────────────
    def _build_stats_bar(self) -> None:
        """Small stats row at the bottom."""
        bar = tk.Frame(self, bg="#141414", pady=6)
        bar.pack(fill="x", side="bottom")

        stats = [
            ("🎮 Games Played", self.stats_played_var),
            ("🏅 Games Won",    self.stats_won_var),
        ]

        for i, (lbl, var) in enumerate(stats):
            frame = tk.Frame(bar, bg="#141414")
            frame.pack(side="left", padx=20)
            tk.Label(frame, text=lbl, font=self.f_stats,
                     fg=TEXT_MUTED, bg="#141414").pack(side="left")
            tk.Label(frame, textvariable=var, font=self.f_stats,
                     fg=TEXT_PRIMARY, bg="#141414").pack(side="left", padx=(4, 0))

        tk.Label(bar, text="Press F2 for New Game  |  Esc to Exit",
                 font=self.f_stats, fg=TEXT_MUTED, bg="#141414").pack(side="right", padx=20)

    # ════════════════════════════════════════════
    #  TTK STYLES
    # ════════════════════════════════════════════
    def _apply_ttk_styles(self) -> None:
        """Apply dark theme to any ttk widgets (future-proofing)."""
        style = ttk.Style(self)
        style.theme_use("clam")
        style.configure(
            "dark.Horizontal.TProgressbar",
            troughcolor=PROGRESS_BG,
            background=PROGRESS_FG,
            darkcolor=PROGRESS_FG,
            lightcolor=PROGRESS_FG,
            bordercolor=PROGRESS_BG,
        )

    # ════════════════════════════════════════════
    #  GAME LOGIC
    # ════════════════════════════════════════════
    def _new_game(self) -> None:
        """
        Initialise / reset a fresh round:
        - Generate a new secret number
        - Reset attempt counter and score
        - Start the timer
        - Clear input and feedback
        """
        play_sound("click")

        self.max_range     = DIFFICULTIES[self.difficulty]["range"]
        self.secret_number = random.randint(1, self.max_range)
        self.attempts      = 0
        self.current_score = 0
        self.game_active   = True

        # Reset UI vars
        self.attempts_var.set("0")
        self.guess_var.set("")
        self.diff_var.set(self.difficulty)
        self.range_label.config(text=f"Range: 1 – {self.max_range}")
        self.feedback_var.set(f"🎲 Game started! Guess a number between 1 and {self.max_range}.")
        self.feedback_label.config(fg=ACCENT)

        # Reset progress
        self._update_progress(0)

        # Update stats
        self.games_played += 1
        self.stats_played_var.set(self.games_played)

        # Restart timer
        self._stop_timer()
        self.start_time = time.time()
        self._tick_timer()

        self.entry.focus_set()

    # ── Difficulty selection ───────────────────────
    def _select_difficulty(self, difficulty: str) -> None:
        """Switch difficulty and immediately start a new game."""
        self.difficulty = difficulty
        self.diff_var.set(difficulty)
        self._highlight_diff_button(difficulty)
        self._new_game()

    def _highlight_diff_button(self, selected: str) -> None:
        """Visually mark the active difficulty button."""
        for name, btn in self._diff_buttons.items():
            if name == selected:
                color = DIFFICULTIES[name]["color"]
                btn.config(bg=color, fg=TEXT_PRIMARY)
                # Override hover to stay at same color
                self._add_hover(btn, color, DIFFICULTIES[name]["hover"])
            else:
                btn.config(bg=BTN_NEUTRAL)
                self._add_hover(btn, BTN_NEUTRAL, BTN_NEUTRAL_H)

    # ── Guess submission ──────────────────────────
    def _submit_guess(self) -> None:
        """
        Validate and evaluate the player's guess.
        Update feedback, attempts, score, and progress bar.
        """
        if not self.game_active:
            self._set_feedback("⚠️  Start a new game first!", WARNING)
            return

        raw = self.guess_var.get().strip()

        # ── Validation ──
        if not raw:
            self._set_feedback("⚠️  Please enter a number before submitting.", WARNING)
            self._shake(self.entry)
            return

        try:
            guess = int(raw)
        except ValueError:
            self._set_feedback("⚠️  Only whole numbers are allowed.", WARNING)
            self._shake(self.entry)
            return

        if guess < 1 or guess > self.max_range:
            self._set_feedback(
                f"⚠️  Enter a number between 1 and {self.max_range}.", WARNING
            )
            self._shake(self.entry)
            return

        # ── Count attempt ──
        self.attempts += 1
        self.attempts_var.set(str(self.attempts))
        self.guess_var.set("")
        self.entry.focus_set()

        # ── Evaluate ──
        if guess < self.secret_number:
            play_sound("wrong")
            self._set_feedback("📈  Try a Higher Number!", DANGER)
            self._update_progress_from_guess(guess)

        elif guess > self.secret_number:
            play_sound("wrong")
            self._set_feedback("📉  Try a Lower Number!", DANGER)
            self._update_progress_from_guess(guess)

        else:
            # ── Correct! ──
            self._on_correct_guess()

    def _on_correct_guess(self) -> None:
        """Handle a correct guess: score, high score, stats, popup."""
        self._stop_timer()
        self.game_active = False
        self.games_won  += 1
        self.stats_won_var.set(self.games_won)

        # Calculate score
        self.current_score = max(0, self.max_range - self.attempts)

        # Check high score
        new_record = False
        if self.current_score > self.best_score:
            self.best_score = self.current_score
            write_high_score(self.best_score)
            self.best_score_var.set(str(self.best_score))
            new_record = True
            play_sound("highscore")
        else:
            play_sound("correct")

        # Full progress
        self._update_progress(100)

        msg = "🎉  Congratulations! You guessed it correctly."
        if new_record:
            msg += "  🏆 NEW HIGH SCORE!"
        self._set_feedback(msg, SUCCESS)

        # Show win popup after short delay (let feedback render)
        self.after(300, lambda: self._show_win_popup(new_record))

    # ── Win popup ─────────────────────────────────
    def _show_win_popup(self, new_record: bool) -> None:
        """
        Modal popup congratulating the player.
        Displays attempts, time taken, and score.
        """
        popup = tk.Toplevel(self)
        popup.title("🎉 You Won!")
        popup.geometry("380x320")
        popup.resizable(False, False)
        popup.configure(bg=BG_CARD)
        popup.transient(self)
        popup.grab_set()

        # Center over parent
        self.update_idletasks()
        px = self.winfo_x() + (700 - 380) // 2
        py = self.winfo_y() + (580 - 320) // 2
        popup.geometry(f"380x320+{px}+{py}")

        # Header
        header_color = SUCCESS if not new_record else WARNING
        tk.Frame(popup, bg=header_color, height=4).pack(fill="x")

        tk.Label(
            popup,
            text="🏆 Congratulations!" if new_record else "🎉 Congratulations!",
            font=tkfont.Font(family="Segoe UI", size=16, weight="bold"),
            fg=TEXT_PRIMARY, bg=BG_CARD, pady=12
        ).pack()

        tk.Label(
            popup,
            text="You guessed the number correctly!",
            font=tkfont.Font(family="Segoe UI", size=10),
            fg=TEXT_SECONDARY, bg=BG_CARD
        ).pack()

        if new_record:
            tk.Label(
                popup, text="⭐ NEW HIGH SCORE! ⭐",
                font=tkfont.Font(family="Segoe UI", size=11, weight="bold"),
                fg=WARNING, bg=BG_CARD, pady=4
            ).pack()

        # Stats grid
        stats_frame = tk.Frame(popup, bg=BG_CARD2, pady=10, padx=20)
        stats_frame.pack(fill="x", padx=20, pady=10)

        elapsed = self._format_elapsed(self.elapsed_seconds)
        rows = [
            ("Secret Number", str(self.secret_number)),
            ("Attempts",      str(self.attempts)),
            ("Time Taken",    elapsed),
            ("Score",         str(self.current_score)),
        ]

        for row, (label, value) in enumerate(rows):
            tk.Label(stats_frame, text=label + ":",
                     font=tkfont.Font(family="Segoe UI", size=10),
                     fg=TEXT_MUTED, bg=BG_CARD2, anchor="w").grid(
                row=row, column=0, sticky="w", pady=2
            )
            tk.Label(stats_frame, text=value,
                     font=tkfont.Font(family="Segoe UI", size=10, weight="bold"),
                     fg=TEXT_PRIMARY, bg=BG_CARD2, anchor="e").grid(
                row=row, column=1, sticky="e", padx=(20, 0), pady=2
            )

        # Buttons
        btn_row = tk.Frame(popup, bg=BG_CARD)
        btn_row.pack(pady=10)

        play_btn = tk.Button(
            btn_row, text="▶  Play Again",
            font=tkfont.Font(family="Segoe UI", size=10, weight="bold"),
            fg=TEXT_PRIMARY, bg=SUCCESS,
            activebackground=SUCCESS_HOVER, bd=0, padx=16, pady=8,
            cursor="hand2",
            command=lambda: [popup.destroy(), self._new_game()]
        )
        play_btn.pack(side="left", padx=8)
        self._add_hover(play_btn, SUCCESS, SUCCESS_HOVER)

        exit_btn = tk.Button(
            btn_row, text="✖  Exit",
            font=tkfont.Font(family="Segoe UI", size=10, weight="bold"),
            fg=TEXT_PRIMARY, bg=DANGER,
            activebackground="#CC0000", bd=0, padx=16, pady=8,
            cursor="hand2",
            command=lambda: [popup.destroy(), self._exit_game()]
        )
        exit_btn.pack(side="left", padx=8)
        self._add_hover(exit_btn, DANGER, "#CC0000")

        popup.bind("<Return>", lambda e: [popup.destroy(), self._new_game()])
        popup.bind("<Escape>", lambda e: [popup.destroy(), self._exit_game()])
        popup.focus_set()

    # ── Score & high-score management ─────────────
    def _reset_high_score(self) -> None:
        """Confirm and reset the persisted high score."""
        if messagebox.askyesno(
            "Reset High Score",
            "Are you sure you want to reset the high score to 0?",
            parent=self
        ):
            self.best_score = 0
            write_high_score(0)
            self.best_score_var.set("0")
            self._set_feedback("🔄  High score has been reset.", ACCENT)

    # ── Exit ──────────────────────────────────────
    def _exit_game(self) -> None:
        """Gracefully stop background tasks and quit."""
        self._stop_timer()
        self.destroy()

    # ════════════════════════════════════════════
    #  TIMER
    # ════════════════════════════════════════════
    def _tick_timer(self) -> None:
        """Update the timer display every second while game is active."""
        if self.game_active:
            self.elapsed_seconds = int(time.time() - self.start_time)
            self.timer_var.set("Time Elapsed: " + self._format_elapsed(self.elapsed_seconds))
            self._timer_id = self.after(1000, self._tick_timer)

    def _stop_timer(self) -> None:
        """Cancel the timer after() loop."""
        if self._timer_id is not None:
            self.after_cancel(self._timer_id)
            self._timer_id = None

    @staticmethod
    def _format_elapsed(seconds: int) -> str:
        """Format integer seconds as MM:SS."""
        m, s = divmod(seconds, 60)
        return f"{m:02d}:{s:02d}"

    # ════════════════════════════════════════════
    #  PROGRESS BAR
    # ════════════════════════════════════════════
    def _update_progress_from_guess(self, guess: int) -> None:
        """
        Calculate closeness percentage based on how near the
        guess is to the secret number within the full range.
        """
        distance   = abs(guess - self.secret_number)
        closeness  = max(0.0, 1.0 - distance / self.max_range)
        percentage = round(closeness * 100, 1)
        self._update_progress(percentage)

    def _update_progress(self, percentage: float) -> None:
        """Draw the progress bar at the given fill percentage (0–100)."""
        self.progress_val.set(percentage)
        self.progress_pct_label.config(text=f"{int(percentage)}%")
        self._redraw_progress()

    def _redraw_progress(self, event=None) -> None:
        """Recompute the progress rectangle width and redraw it."""
        total_w    = self.progress_canvas.winfo_width()
        percentage = self.progress_val.get()
        fill_w     = int(total_w * percentage / 100)
        self.progress_canvas.coords(self.progress_bar_rect, 0, 0, fill_w, 12)

        # Colour gradient: red → yellow → green
        if percentage < 40:
            color = DANGER
        elif percentage < 70:
            color = WARNING
        else:
            color = SUCCESS
        self.progress_canvas.itemconfig(self.progress_bar_rect, fill=color)

    # ════════════════════════════════════════════
    #  VALIDATION
    # ════════════════════════════════════════════
    @staticmethod
    def _validate_integer(value: str) -> bool:
        """
        Tkinter entry validation callback.
        Accepts empty string (clearing field) or digit-only strings.
        """
        return value == "" or value.lstrip("-").isdigit()

    # ════════════════════════════════════════════
    #  UI HELPERS
    # ════════════════════════════════════════════
    def _set_feedback(self, message: str, color: str = TEXT_PRIMARY) -> None:
        """Update the feedback label with a new message and colour."""
        self.feedback_var.set(message)
        self.feedback_label.config(fg=color)

    def _add_hover(
        self, widget: tk.Widget, normal_bg: str, hover_bg: str
    ) -> None:
        """Bind enter/leave events to simulate a hover effect."""
        widget.bind("<Enter>", lambda e: widget.config(bg=hover_bg))
        widget.bind("<Leave>", lambda e: widget.config(bg=normal_bg))

    def _shake(self, widget: tk.Widget) -> None:
        """
        Briefly animate a widget to indicate invalid input.
        Moves it left/right a few pixels.
        """
        orig_x = widget.winfo_x()
        orig_y = widget.winfo_y()

        def _step(offsets, idx=0):
            if idx < len(offsets):
                widget.place(x=orig_x + offsets[idx], y=orig_y)
                self.after(30, lambda: _step(offsets, idx + 1))
            else:
                widget.place_forget()
                widget.pack(side="left", ipady=10, padx=(0, 10))

        # We only shake if the widget is pack-managed
        # Use a simple highlight flash instead to avoid geometry conflicts
        orig_fg = widget.cget("bg")
        widget.config(bg=DANGER)
        self.after(180, lambda: widget.config(bg=orig_fg))


# ══════════════════════════════════════════════
#  Entry point
# ══════════════════════════════════════════════
if __name__ == "__main__":
    app = Game()
    app.mainloop()

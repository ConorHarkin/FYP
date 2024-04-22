from datetime import datetime
from flask import Flask, render_template, redirect, url_for, flash, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User, Friendship, Post, Comment, Workout, FoodEntry
from forms import SignupForm, SigninForm
from flask_login import LoginManager, login_user, logout_user, current_user, UserMixin, login_required
from werkzeug.utils import secure_filename
from flask_migrate import Migrate
import json
import os


# Initialize the Flask app and configure it
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/fypdatabase'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'supersafesecretkey'  # Set a secret key for CSRF protection


db.init_app(app)

with app.app_context():
    db.create_all()

    
migrate = Migrate(app, db)

# Import models and forms after initializing SQLAlchemy to avoid circular imports
from models import User
from forms import SignupForm, SigninForm

# Initialize Flask-Login
login_manager = LoginManager(app)
login_manager.login_view = 'auth'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))



@app.route('/auth', methods=['GET', 'POST'])
def auth():
    if current_user.is_authenticated:
        return redirect(url_for('home'))

    sign_in_form = SigninForm()
    sign_up_form = SignupForm()

    if request.method == 'POST':
        # Use the submit button names to distinguish between forms
        if sign_in_form.validate_on_submit() and 'btn-login' in request.form:
            # Login logic
            user = User.query.filter_by(email=sign_in_form.email.data).first()
            if user and check_password_hash(user.password_hash, sign_in_form.password.data):
                login_user(user)
                flash('You have been logged in!', 'success')
                return redirect(url_for('home'))
            else:
                flash('Invalid email or password.', 'danger')

        elif sign_up_form.validate_on_submit() and 'btn-signup' in request.form:
            # Sign-up logic
            hashed_password = generate_password_hash(sign_up_form.password.data)
            new_user = User(username=sign_up_form.username.data, email=sign_up_form.email.data, password_hash=hashed_password)
            db.session.add(new_user)
            try:
                db.session.commit()
                login_user(new_user)
                flash('Account created successfully! Please log in.', 'success')
                return redirect(url_for('home'))
            except Exception as e:
                db.session.rollback()
                flash('An error occurred: ' + str(e), 'error')
                app.logger.error('Error on sign up: %s', e)

    return render_template('auth.html', sign_in_form=sign_in_form, sign_up_form=sign_up_form)





@app.route('/')
@login_required
def home():
    # Get IDs of current user's friends, considering both directions of friendship
    friend_ids = db.session.query(Friendship.friend_id).filter(Friendship.user_id == current_user.id).all()
    friend_ids += db.session.query(Friendship.user_id).filter(Friendship.friend_id == current_user.id).all()
    # Flatten the list of tuples and remove duplicates, excluding the current user's ID
    friend_ids = set(id[0] for id in friend_ids if id[0] != current_user.id)

    # Fetch the posts made by friends
    friend_posts = Post.query.filter(Post.user_id.in_(friend_ids)).order_by(Post.created_at.desc()).all()

    # Fetch the user objects for the friends' IDs
    friends = User.query.filter(User.id.in_(friend_ids)).all()

    # Ensure that friends are always passed to the template, regardless of whether a search was performed
    return render_template('home.html', friends=friends, friend_posts=friend_posts)






@app.route('/signin', methods=['POST'])
def signin():
    form = SigninForm(request.form)
    if form.validate_on_submit():
        # Retrieve the input from the form
        login_input = form.email.data  # Assuming 'email' field is used for both email and username inputs
        password_input = form.password.data

        # Check database for user by email or username
        user = User.query.filter((User.email == login_input) | (User.username == login_input)).first()
        
        if user and check_password_hash(user.password_hash, password_input):
            login_user(user)
            flash('You have been logged in!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Invalid login credentials.', 'error')

    return render_template('auth.html', sign_in_form=form)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    sign_in_form = SigninForm()  # Initialize sign-in form
    sign_up_form = SignupForm()  # Initialize sign-up form

    if request.method == 'POST' and sign_up_form.validate_on_submit():
        # Check if username or email already exists in the database
        existing_user = User.query.filter((User.username == sign_up_form.username.data) | (User.email == sign_up_form.email.data)).first()
        if existing_user:
            if existing_user.username == sign_up_form.username.data:
                flash('This username is already taken. Please choose another one.', 'error')
            if existing_user.email == sign_up_form.email.data:
                flash('This email is already registered. Please use another email or login.', 'error')
            return render_template('auth.html', sign_in_form=sign_in_form, sign_up_form=sign_up_form)

        # If username and email are unique, proceed with creating a new user
        hashed_password = generate_password_hash(sign_up_form.password.data)
        new_user = User(username=sign_up_form.username.data, email=sign_up_form.email.data, password_hash=hashed_password)

        # Add the new user to the database
        db.session.add(new_user)
        try:
            db.session.commit()  # Attempt to commit changes to the database
            login_user(new_user)  # Log in the new user
            flash('Account created successfully! You are now logged in.', 'success')
            return redirect(url_for('home'))  # Redirect to the home page
        except Exception as e:
            db.session.rollback()  # Rollback in case of error
            flash('An error occurred: ' + str(e), 'error')  # Flash an error message
            app.logger.error('Error on sign up: %s', e)  # Log the error

    else:
        # If it's a GET request or the form didn't validate on POST, show form errors
        for field, errors in form.errors.items():
            for error in errors:
                flash(f"Error in the {getattr(sign_up_form, field).label.text} field - {error}", 'error')

    return render_template('auth.html', sign_in_form=sign_in_form, sign_up_form=sign_up_form)  # Pass both forms to the template



@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('home'))  # Redirects the user to the home page after logging out

@app.route('/search_users', methods=['POST'])
def search_users():
    search_query = request.form.get('search')
    # Exclude the current user from search results
    users = User.query.filter(
        User.username.ilike(f'%{search_query}%'),
        User.id != current_user.id  # Exclude the current user based on their ID
    ).all()

    # Fetch current user's friends
    friend_ids = db.session.query(Friendship.friend_id).filter(Friendship.user_id == current_user.id).all()
    friend_ids += db.session.query(Friendship.user_id).filter(Friendship.friend_id == current_user.id).all()
    friend_ids = set(id[0] for id in friend_ids if id[0] != current_user.id)

    friends = User.query.filter(User.id.in_(friend_ids)).all()
    friend_usernames = {friend.username for friend in friends}  # Use a set for quick lookup

    return render_template('home.html', search_results=users, friend_usernames=friend_usernames, friends=friends)




@app.route('/add_friend/<int:user_id>', methods=['POST'])
def add_friend(user_id):
    if not current_user.is_authenticated:
        return redirect(url_for('auth'))
    
    # Check if the friendship already exists to prevent duplicates
    existing_friendship = Friendship.query.filter_by(
        user_id=current_user.id, friend_id=user_id
    ).first()

    if not existing_friendship:
        new_friendship = Friendship(user_id=current_user.id, friend_id=user_id)
        db.session.add(new_friendship)
        db.session.commit()
        flash('Friend added successfully!', 'success')
    else:
        flash('You are already friends.', 'info')

    return redirect(url_for('home'))

@app.route('/create_post', methods=['POST'])
@login_required
def create_post():
    content = request.form.get('content')
    # Handle image upload if necessary
    new_post = Post(content=content, user_id=current_user.id)
    db.session.add(new_post)
    db.session.commit()
    flash('Your post has been created.', 'success')
    return redirect(url_for('home'))

@app.route('/create_comment/<int:post_id>', methods=['POST'])
@login_required
def create_comment(post_id):
    content = request.form.get('content')
    new_comment = Comment(content=content, user_id=current_user.id, post_id=post_id)
    db.session.add(new_comment)
    db.session.commit()
    flash('Your comment has been added.', 'success')
    return redirect(url_for('home'))

@app.route('/workout')
@login_required
def workout():
   

    date_today = datetime.now().strftime('%d/%m/%Y')
    date_today_obj = datetime.strptime(date_today, '%d/%m/%Y')
    return render_template('workout.html', date_today=date_today_obj)

@app.route('/save_workout', methods=['POST'])
@login_required
def save_workout():
    workout_data = request.get_json()
    date = datetime.strptime(workout_data['date'], '%Y-%m-%d').date()
   
    # Delete existing workouts for the user on the given date
    Workout.query.filter_by(user_id=current_user.id, date=date).delete()
   
    for exercise in workout_data['exercises']:
        exercise_name = exercise['name']
        for set_info in exercise['sets']:
            new_workout = Workout(
                user_id=current_user.id,
                date=date,
                exercise_name=exercise_name,
                weight=float(set_info['weight']),
                reps=int(set_info['reps']),
                set_number=int(set_info['set'])
            )
            db.session.add(new_workout)
   
    db.session.commit()
    return jsonify(success=True)

@app.route('/load_workout/<date>')
@login_required
def load_workout(date):
    try:
        date = datetime.strptime(date, '%Y-%m-%d').date()
        user_id = current_user.id
        workouts = Workout.query.filter_by(user_id=user_id, date=date).all()
        workout_data = {}
        for workout in workouts:
            if workout.exercise_name not in workout_data:
                workout_data[workout.exercise_name] = []
            workout_data[workout.exercise_name].append({
                'set': workout.set_number,
                'weight': workout.weight,
                'reps': workout.reps
            })
        return jsonify(workout_data)
    except ValueError:
        return jsonify({"error": "Invalid date format. Please use 'YYYY-MM-DD'."})

@app.route('/nutrition')
@login_required
def nutrition():
    

    date_today = datetime.now().strftime('%Y-%m-%d')
    food_entries = FoodEntry.query.filter_by(
        user_id=current_user.id,
        date=datetime.now().date()
    ).all()

    # Pass the formatted date and the query results to the template
    return render_template('nutrition.html', date_today=date_today, food_entries=food_entries)


@app.route('/save_food_entry', methods=['POST'])
@login_required
def save_food_entry():
    try:
        data = request.json
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()
       
        for meal_name, items in data['meals'].items():
            for item in items:
                if not all(value == 0 for value in [item['amount'], item['calories'], item['carbs'], item['protein'], item['fat']]):
                    food_entry = FoodEntry(
                        user_id=current_user.id,
                        date=date,
                        meal=meal_name,
                        food=item['food'],
                        amount=item['amount'],
                        calories=item['calories'],
                        carbs=item['carbs'],
                        protein=item['protein'],
                        fat=item['fat']
                    )
                    db.session.add(food_entry)
       
        db.session.commit()
        return jsonify(success=True)
    except Exception as e:
        db.session.rollback()
        return jsonify(success=False, error=str(e)), 500

@app.route('/get_food_entries')
@login_required
def get_food_entries():
    date_str = request.args.get('date')
    date = datetime.strptime(date_str, '%Y-%m-%d').date()

    food_entries = FoodEntry.query.filter_by(user_id=current_user.id, date=date).all()

    entries_by_meal = {}
    for entry in food_entries:
        meal = entry.meal
        if meal not in entries_by_meal:
            entries_by_meal[meal] = []
        entries_by_meal[meal].append({
            'food': entry.food,
            'amount': entry.amount,
            'calories': entry.calories,
            'carbs': entry.carbs,
            'protein': entry.protein,
            'fat': entry.fat
        })

    return jsonify(entries_by_meal)


@app.route('/get_comments/<int:post_id>', methods=['GET'])
@login_required
def get_comments(post_id):
    # Fetch comments for post_id from the database
    comments = Comment.query.filter_by(post_id=post_id).all()
    comments_list = [{'user': comment.user.username, 'content': comment.content} for comment in comments]
    return jsonify(comments_list)

@app.route('/add_comment/<int:post_id>', methods=['POST'])
@login_required
def add_comment(post_id):
    content = request.form.get('content')
    if content:
        # Create and save the new comment
        new_comment = Comment(content=content, user_id=current_user.id, post_id=post_id)
        db.session.add(new_comment)
        db.session.commit()
        return jsonify(success=True, message="Comment added successfully.")
    else:
        return jsonify(success=False, message="No content provided."), 400

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html')


if __name__ == '__main__':
    with app.app_context():
        app.run(debug=True)

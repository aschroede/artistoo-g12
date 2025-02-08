import os
import re
import subprocess

def images_to_video(image_dir, output_video="simulation.mp4", fps=30):
    """
    Converts a sequence of images into a video using ffmpeg.
    
    :param image_dir: Directory containing images (e.g., "ObstacleModel1")
    :param output_video: Name of the output video file (default: "simulation.mp4")
    :param fps: Frames per second for the output video (default: 30)
    """
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Get all images matching the pattern "ObstacleModel-tX.png"
    images = sorted(
        [f for f in os.listdir(image_dir) if re.match(r"ObstacleModel-t\d+\.png", f)],
        key=lambda x: int(re.search(r"-t(\d+)", x).group(1))  # Sort by timestep
    )

    if not images:
        print("❌ No matching images found in the directory.")
        return

    # Create a temporary list file for ffmpeg input
    list_file = os.path.join(image_dir, "image_list.txt")
    with open(list_file, "w") as f:
        for img in images:
            f.write(f"file '{os.path.abspath(os.path.join(image_dir, img))}'\n")


    # FFmpeg command
    command = [
        "ffmpeg",
        "-r", str(fps),
        "-f", "concat",
        "-safe", "0",
        "-i", list_file,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-y", output_video
    ]

    # Run FFmpeg
    subprocess.run(command, check=True)
    print(f"✅ Video saved as {output_video}")

# Example usage
images_to_video("output/img/ObstacleModel4", "output/img/ObstacleModel4/simulation.mp4", fps=30)

#!/bin/bash
# Quick script to run RLS policy tests with configured credentials

export TEST_STUDENT_EMAIL="crodriguez1@hawk.illinoistech.edu"
export TEST_STUDENT_PASSWORD="An9Car99!"
export TEST_TEACHER_EMAIL="c.a.rodriguez1999@gmail.com"
export TEST_TEACHER_PASSWORD="An9Car99!!"

cd "$(dirname "$0")/.."
node utils/test-rls-policies.js


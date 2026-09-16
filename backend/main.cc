#include <iostream>
#include <string>
#include <vector>

using namespace std;

class Repair {
    private:
        int day;
        int month;
        int year;
        int cost;
        int km;
        string tittle;
        string description;
    public:
        Repair(int d, int m, int y, int c, int k, string t, string desc): day(d), month(m), year(y), cost(c), km(k), tittle(t), description(desc) {}

        //Getters

        int getDay() const {
            return day;
        }

        int getMonth() const {
            return month;
        }

        int getYear() const {
            return year;
        }

        int getCost() const {
            return cost;
        }

        string getTittle() const {
            return tittle;
        }

        string getDescription() const {
            return description;
        }

        string getFormattedDate() {
            return to_string(day) +  '/' + to_string(month) + '/' + to_string(year);
        }

        //Others

        bool isBefore(const Repair& other) const {
            if (year < other.year) {
                return true;
            }
            else if (year == other.year && month < other.month) {
                return true;
            }
            else if (year == other.year && month == other.month && day < other.day) {
                return true;
            }
            else {
                return false;
            }
        }


};

class Car {
    private:
        string make;
        string model;
        string alias;
        int year;
        int km;
        vector<Repair> repairs;
    
    public:
        Car(string ma, string mod, int yr, int milage): make(ma), model(mod), year(yr), km(milage) {}

        //Getters

        string getMake() const {
            return make;
        }
        
        string getModel() const {
            return model;
        }
        
        string getAlias() const {
            return alias;
        }

        int getYear() const {
            return year;
        }
        
        int getKm() const {
            return km;
        }

        int setKm(int milage) {
            if (milage >= 0) {
                km = milage;
                return 0;
            }
            else {
                return 1;
            }
        }

        //Setters

        void setAlias(string st) {
            alias = st;
        }

        //Others

        int addKm(int add) {
            if (add >= 0) {
                km += add;
                return 0;
            }
            else {
                return 1;
            }
        }

        void addRepair(const Repair& repair) {
            int left = 0;
            int right = repairs.size();

            while(left < right) {
                int middle = left + (right - left) / 2;

                if (repairs[middle].isBefore(repair)) {
                    left = middle + 1;
                }
                else {
                    right = middle;
                }
            }

            repairs.push_back(repair);

            for (int i = static_cast<int>(repairs.size()) - 1; i > left; i--) {
                repairs[i] = repairs[i - 1];
            }

            repairs[left] = repair;
        }
};